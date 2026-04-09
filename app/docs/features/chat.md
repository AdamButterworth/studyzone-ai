# Chat Feature Plan

## Overview
RAG-powered Q&A grounded in the document's content. Conversational, streamed responses.

---

## V1 (Done ✅)

### What's built
- API route `/api/chat` — embed question → vector search → Gemini Flash stream
- Scoped to single document (passes `document_id`)
- Conversation history (last 10 messages as context)
- Streaming responses with typing indicator
- Bouncing dots while waiting for first token

### How it works
1. User asks question
2. Embed question via `gemini-embedding-001` (768-dim)
3. Call `match_chunks` RPC — top 6 chunks from this document
4. Build prompt: system instructions + retrieved chunks + history + question
5. Gemini 3 Flash streams the answer

---

## V2 (Later)

### Subject-wide chat
- Toggle between "this document" and "this subject"
- Subject mode: `match_chunks` with `match_subject_id` instead of `match_document_id`
- Searches across all indexed docs in the subject

### Source citations
- Show which chunks were used in the answer
- Clickable references that scroll to the relevant part of the PDF
- Requires page number mapping in chunks

### Chat persistence
- Save chat sessions to DB (`chat_sessions` + `chat_messages` tables — already in schema)
- Resume conversations across page loads
- Show chat history in "My Resources" section

### Suggested questions
- After indexing, generate 3-4 suggested questions from the document
- Show as clickable pills in the chat empty state

### Better context management
- Smart truncation of history to fit context window
- Summarize old messages instead of dropping them
