import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY")!;

const CHUNK_SIZE = 500; // target tokens per chunk
const CHUNK_OVERLAP = 50; // overlap words between chunks
const EMBEDDING_BATCH_SIZE = 100; // max texts per embedding API call

/* ─── Helpers ─── */

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function chunkText(text: string): { text: string; tokenCount: number }[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const rawChunks: string[] = [];

  for (const para of paragraphs) {
    const tokens = estimateTokens(para);
    if (tokens <= CHUNK_SIZE) {
      rawChunks.push(para.trim());
    } else {
      // Split long paragraphs on sentences
      const sentences = para.split(/(?<=[.!?])\s+/);
      let current = "";
      for (const sentence of sentences) {
        if (estimateTokens(current + " " + sentence) > CHUNK_SIZE && current) {
          rawChunks.push(current.trim());
          current = sentence;
        } else {
          current = current ? current + " " + sentence : sentence;
        }
      }
      if (current.trim()) rawChunks.push(current.trim());
    }
  }

  // Merge small adjacent chunks
  const merged: string[] = [];
  for (const chunk of rawChunks) {
    if (
      merged.length > 0 &&
      estimateTokens(merged[merged.length - 1]) + estimateTokens(chunk) <= CHUNK_SIZE
    ) {
      merged[merged.length - 1] += "\n\n" + chunk;
    } else {
      merged.push(chunk);
    }
  }

  // Add overlap between adjacent chunks
  const withOverlap: { text: string; tokenCount: number }[] = [];
  for (let i = 0; i < merged.length; i++) {
    let chunkStr = merged[i];

    if (i > 0) {
      const prevWords = merged[i - 1].split(/\s+/);
      const overlapWords = prevWords.slice(-CHUNK_OVERLAP);
      if (overlapWords.length > 0) {
        chunkStr = overlapWords.join(" ") + "\n\n" + chunkStr;
      }
    }

    withOverlap.push({
      text: chunkStr,
      tokenCount: estimateTokens(chunkStr),
    });
  }

  return withOverlap;
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: batch.map((text) => ({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] },
          })),
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    for (const emb of data.embeddings) {
      allEmbeddings.push(emb.values);
    }
  }

  return allEmbeddings;
}

/* ─── Main handler ─── */

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  let documentId: string | null = null;

  try {
    const body = await req.json();
    documentId = body.document_id;

    if (!documentId) {
      return new Response(JSON.stringify({ error: "document_id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch document
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, file_path, status, user_id")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!doc.file_path) {
      return new Response(JSON.stringify({ error: "No file attached" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // 2. Mark as processing
    await supabase
      .from("documents")
      .update({ status: "processing", upload_error: null })
      .eq("id", documentId);

    // 3. Delete any old chunks (for retry case)
    await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);

    // 4. Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(doc.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download PDF: ${downloadError?.message}`);
    }

    // 5. Extract text using pdf-parse
    const pdfParse = (await import("https://esm.sh/pdf-parse@1.1.1")).default;
    const buffer = await fileData.arrayBuffer();
    const pdf = await pdfParse(new Uint8Array(buffer));

    const rawText = pdf.text;
    const pageCount = pdf.numpages;
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;

    // Save raw text + metadata
    await supabase
      .from("documents")
      .update({ raw_text: rawText, page_count: pageCount, word_count: wordCount })
      .eq("id", documentId);

    // 6. Chunk
    const chunks = chunkText(rawText);

    if (chunks.length === 0) {
      throw new Error("No text could be extracted from this PDF");
    }

    // 7. Embed
    const embeddings = await embedTexts(chunks.map((c) => c.text));

    // 8. Insert chunks with embeddings
    const rows = chunks.map((chunk, i) => ({
      document_id: documentId,
      chunk_index: i,
      text: chunk.text,
      token_count: chunk.tokenCount,
      embedding: JSON.stringify(embeddings[i]),
    }));

    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error: insertError } = await supabase
        .from("document_chunks")
        .insert(batch);

      if (insertError) {
        throw new Error(`Failed to insert chunks: ${insertError.message}`);
      }
    }

    // 9. Mark as indexed
    await supabase
      .from("documents")
      .update({
        status: "indexed",
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({
        success: true,
        chunks: chunks.length,
        pages: pageCount,
        words: wordCount,
      }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err) {
    console.error("Processing error:", err);

    // Mark document as error + clean up partial chunks
    if (documentId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from("documents")
          .update({
            status: "error",
            upload_error: err instanceof Error ? err.message : "Unknown processing error",
          })
          .eq("id", documentId);

        await supabase
          .from("document_chunks")
          .delete()
          .eq("document_id", documentId);
      } catch {
        // Best effort cleanup
      }
    }

    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Processing failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
