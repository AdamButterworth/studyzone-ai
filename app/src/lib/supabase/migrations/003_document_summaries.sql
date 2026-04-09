-- Migration: Add document_summaries table
-- Run this in Supabase SQL Editor

CREATE TABLE document_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  prompt_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_summaries_document ON document_summaries(document_id);
CREATE INDEX idx_summaries_latest ON document_summaries(document_id, created_at DESC);

ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own summaries" ON document_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON document_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
