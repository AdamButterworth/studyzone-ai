-- Migration: Add upload support to documents table + storage bucket
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add new columns to documents
-- ============================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ready'
  CHECK (status IN ('uploading', 'ready', 'error'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_filename TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS upload_error TEXT;

-- ============================================
-- 2. Harden INSERT RLS policy (subject must belong to user)
-- ============================================
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_id AND subjects.user_id = auth.uid())
);

-- ============================================
-- 3. Create private storage bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,  -- 50MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- ============================================
-- 4. Storage RLS policies (user can only access own path)
-- ============================================
CREATE POLICY "Users can upload to own path"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
