import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { document_id, user_id } = await req.json();

    if (!document_id || !user_id) {
      return Response.json({ error: "document_id and user_id required" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch document and verify ownership
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("raw_text, title, status, user_id")
      .eq("id", document_id)
      .single();

    if (docError || !doc) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.user_id !== user_id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!doc.raw_text || doc.raw_text.trim().length === 0) {
      return Response.json(
        { error: "Document has no text content yet. Wait for processing to complete." },
        { status: 400 }
      );
    }

    // 2. Truncate if excessively long (safety valve)
    const MAX_CHARS = 500_000;
    const rawText =
      doc.raw_text.length > MAX_CHARS
        ? doc.raw_text.slice(0, MAX_CHARS) + "\n\n[Document truncated for summarization]"
        : doc.raw_text;

    // 3. System prompt
    const systemPrompt = `You are a study assistant for StudyZone AI. Generate a comprehensive, well-structured summary of the following document.

FORMATTING RULES:
- Use Markdown with clear hierarchy: ## for main sections, ### for subsections
- Use **bold** for key terms and concepts on their first appearance
- Use bullet points (- ) for lists of related concepts
- Use numbered lists (1. ) for sequential processes or ranked items
- Include a "## Key Concepts" section at the top with the most important ideas
- Include a "## Main Takeaways" section at the end with 3-5 actionable takeaways
- If the document contains formulas or equations, present them clearly
- If relevant, include a brief table (GFM format) comparing concepts
- Keep the summary thorough but concise — aim for roughly 20-30% of the original length
- Write in a clear, educational tone suitable for studying
- Do NOT include a title heading (the UI provides that separately)

DOCUMENT TITLE: ${doc.title || "Untitled"}

DOCUMENT CONTENT:
${rawText}`;

    // 4. Call Gemini Flash with streaming
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse&key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: "user",
              parts: [{ text: "Generate a structured summary of this document." }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, err);
      return Response.json({ error: "AI generation failed" }, { status: 500 });
    }

    // 5. Stream response back and accumulate for persistence
    const encoder = new TextEncoder();
    let fullText = "";

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
                  fullText += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }

          // 6. Save completed summary to DB (only on success)
          if (fullText.trim()) {
            const { error: insertError } = await supabase
              .from("document_summaries")
              .insert({
                document_id,
                user_id,
                content: fullText,
                model: "gemini-3-flash-preview",
                prompt_version: "v1",
              });

            if (insertError) {
              console.error("Failed to save summary:", insertError);
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
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
    console.error("Summary API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
