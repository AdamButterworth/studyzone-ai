# StudyZone AI — TODO

## Up Next
- [ ] Subdomain routing: serve app from `app.studyzoneai.com` instead of `studyzoneai.com/app`
- [ ] Subject deletion (three-dot menu on subject cards)

## File Uploads & Documents
- [ ] Set up Supabase Storage bucket for file uploads
- [ ] Upload API route + wire existing upload modal
- [ ] Document listing within each subject (UI exists, needs backend)
- [ ] PDF text extraction
- [ ] DOCX/TXT support

## Indexing & Q&A (RAG)
- [ ] Text chunking pipeline (populate `document_chunks` table)
- [ ] Embeddings with pgvector (or direct chunk passing to Claude)
- [ ] Chat with document — wire existing chat UI to Claude API
- [ ] AI-generated summaries, lesson plans, flashcards

## YouTube / Links
- [ ] YouTube URL paste → fetch transcript → store as document
- [ ] Web link content extraction

## Polish
- [ ] Document detail page — load real data instead of mocks
- [ ] Persist chat history, notes, generated content to DB
- [ ] Progress tracking on lesson plans
