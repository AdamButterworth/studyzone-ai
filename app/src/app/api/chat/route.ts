import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

/* ─── Embed a query ─── */
async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);
  const data = await res.json();
  return data.embedding.values;
}

/* ─── Main handler ─── */
export async function POST(req: NextRequest) {
  try {
    const { message, document_id, history } = await req.json();

    if (!message || !document_id) {
      return Response.json({ error: "message and document_id required" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Embed the question
    const queryEmbedding = await embedQuery(message);

    // 2. Vector search — find relevant chunks from this document
    const { data: chunks, error: searchError } = await supabase.rpc("match_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_document_id: document_id,
      match_count: 6,
    });

    if (searchError) {
      console.error("Vector search error:", searchError);
      return Response.json({ error: "Search failed" }, { status: 500 });
    }

    // 3. Build context from retrieved chunks
    const context = (chunks || [])
      .map((c: { chunk_index: number; text: string; similarity: number }) =>
        `[Chunk ${c.chunk_index + 1}, relevance: ${(c.similarity * 100).toFixed(0)}%]\n${c.text}`
      )
      .join("\n\n---\n\n");

    // 4. Build conversation for Gemini
    const systemPrompt = `You are a helpful study assistant for StudyZone AI. Answer questions based on the document content provided below. Be concise, clear, and educational. If the answer isn't in the provided content, say so honestly.

DOCUMENT CONTEXT:
${context}`;

    const contents = [];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 5. Call Gemini Flash with streaming
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse&key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, err);
      return Response.json({ error: "AI generation failed" }, { status: 500 });
    }

    // 6. Stream the response back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const json = line.slice(6).trim();
              if (!json || json === "[DONE]") continue;

              try {
                const parsed = JSON.parse(json);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
