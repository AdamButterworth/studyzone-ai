import { SupabaseClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["application/pdf"];

interface UploadResult {
  documentId: string;
  title: string;
  error?: string;
}

export async function uploadDocument(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  subjectId: string
): Promise<UploadResult> {
  // Client-side validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { documentId: "", title: "", error: "Only PDF files are supported." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { documentId: "", title: "", error: "File must be under 50MB." };
  }

  let title = file.name.replace(/\.pdf$/i, "");

  // Check for duplicate titles in this subject and append number if needed
  const { data: existing } = await supabase
    .from("documents")
    .select("title")
    .eq("subject_id", subjectId)
    .eq("user_id", userId)
    .ilike("title", `${title}%`);

  if (existing && existing.length > 0) {
    const titles = new Set(existing.map((d: { title: string }) => d.title));
    if (titles.has(title)) {
      let n = 2;
      while (titles.has(`${title} (${n})`)) n++;
      title = `${title} (${n})`;
    }
  }

  // Phase 1: Create DB row with status='uploading'
  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      subject_id: subjectId,
      title,
      type: "pdf",
      status: "uploading",
      mime_type: file.type,
      size_bytes: file.size,
      original_filename: file.name,
    })
    .select("id")
    .single();

  if (insertError || !doc) {
    console.error("Document insert failed:", insertError);
    return { documentId: "", title: "", error: `Failed to create document record: ${insertError?.message || "unknown"}` };
  }

  const documentId = doc.id;
  const storagePath = `${userId}/${subjectId}/${documentId}.pdf`;

  // Phase 2: Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError);
    // Cleanup: mark row as error
    await supabase
      .from("documents")
      .update({ status: "error", upload_error: uploadError.message })
      .eq("id", documentId);

    return { documentId, title, error: `Upload failed: ${uploadError.message}` };
  }

  // Phase 3: Update row to 'ready' with file path
  const { error: updateError } = await supabase
    .from("documents")
    .update({
      file_path: storagePath,
      status: "ready",
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (updateError) {
    // Cleanup: try to delete the uploaded file
    await supabase.storage.from("documents").remove([storagePath]);
    await supabase
      .from("documents")
      .update({ status: "error", upload_error: "Failed to finalize upload." })
      .eq("id", documentId);

    return { documentId, title, error: "Failed to finalize upload." };
  }

  // Phase 4: Trigger processing (non-blocking)
  supabase.functions.invoke("process-document", {
    body: { document_id: documentId },
  }).then((res) => {
    if (res.error) console.error("Processing trigger failed:", res.error);
  });

  return { documentId, title };
}

export async function getDocumentSignedUrl(
  supabase: SupabaseClient,
  filePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600); // 1 hour

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function deleteDocumentFile(
  supabase: SupabaseClient,
  filePath: string
): Promise<void> {
  await supabase.storage.from("documents").remove([filePath]);
}
