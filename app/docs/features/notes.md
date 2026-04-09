# Notes Feature Plan

## Overview
Simple note-taking tied to a document. No AI — just persistence.

---

## V1 (Next)

### What to build
- Save/load notes from DB per document
- Auto-save on typing (debounced, same pattern as subject name)
- Plain textarea — no rich editor

### Storage
- `document_notes` table: `id`, `document_id`, `user_id`, `content` (text), `updated_at`
- One note per document per user

### UI
- Current textarea UI already exists
- Wire to DB instead of local state
- Show "Saved" indicator

---

## V2 (Later)

### Rich text editor
- Markdown editing (bold, headers, lists)
- Or block-based editor (like Notion)

### AI-assisted notes
- "Summarize my notes" button
- "Fill in gaps" — AI suggests what's missing based on the document
- Highlight text in PDF → add to notes

### Export
- Copy, download as markdown/PDF
