-- Migration: Add document_chunks table + pgvector support
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Enable pgvector (should already be enabled via dashboard)
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Make vector type accessible from public schema
GRANT USAGE ON SCHEMA extensions TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO PUBLIC;

-- ============================================
-- 2. Update documents status to include processing + indexed
-- ============================================
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents ADD CONSTRAINT documents_status_check
  CHECK (status IN ('uploading', 'ready', 'processing', 'indexed', 'error'));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ;

-- ============================================
-- 3. Create document_chunks table
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  chunk_index INT NOT NULL,
  text TEXT NOT NULL,
  token_count INT,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- 4. RLS for document_chunks
-- ============================================
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chunks" ON document_chunks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM documents WHERE documents.id = document_id AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage chunks" ON document_chunks FOR ALL
  USING (true) WITH CHECK (true);

-- ============================================
-- 5. Vector similarity search function
-- ============================================
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(768),
  match_document_id UUID DEFAULT NULL,
  match_subject_id UUID DEFAULT NULL,
  match_count INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INT,
  text TEXT,
  token_count INT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.text,
    dc.token_count,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE
    d.status = 'indexed'
    AND (match_document_id IS NULL OR dc.document_id = match_document_id)
    AND (match_subject_id IS NULL OR d.subject_id = match_subject_id)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
