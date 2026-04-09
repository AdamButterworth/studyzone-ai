# Summary Feature Plan

## Overview
One-click document summarization. Each document gets one summary — persisted, regenerable.

---

## V1 (Now)

### Generation
- **Technique:** Single-shot — send full `raw_text` to Gemini Flash with structured prompt
- **Model:** Gemini 3 Flash Preview (same as chat)
- **Prompt:** Ask for markdown output with:
  - Section headings (h2)
  - Key concepts in bold
  - Bullet points for lists
  - Tables where appropriate (comparisons, data)
  - Brief page/section references where possible
- **No map-reduce** — Gemini Flash handles 1M tokens; most academic PDFs are well under 100K
- **Streaming:** Yes — show summary generating in real-time

### Storage
- New `document_summaries` table:
  - `id`, `document_id` (unique), `content` (markdown text), `created_at`
- One summary per document
- If summary exists → show it immediately (no re-generation)
- "Regenerate" button → deletes old, generates fresh

### Rendering
- `react-markdown` + `remark-gfm` (tables, strikethrough, etc.)
- Styled with our font/color system (font-app, text-ink, etc.)
- Headings, lists, tables, bold/italic, code blocks
- Scrollable within the right panel

### UI Flow
1. User clicks "Summary" tab
2. Check if summary exists in DB
3. If yes → render immediately
4. If no → show "Generating summary..." with spinner
5. Stream response from API, save to DB when complete
6. Show "Regenerate" button at the bottom

### API Route
- `POST /api/summary` — accepts `document_id`
- Fetches `raw_text` from documents table
- Sends to Gemini Flash with summary system prompt
- Streams response back
- Saves completed summary to `document_summaries`

### Cost
- ~$0.002-0.01 per summary depending on doc length
- One-time cost per document (cached after)

---

## V2 (Later)

### Map-Reduce for Long Documents
- For docs over ~100K tokens, split into sections
- Summarize each section independently
- Combine section summaries into final summary
- Adds complexity: multiple API calls, merge prompt, progress tracking

### Page Citations
- Inline badges like YouLearn (`p. 1`, `p. 2`)
- Requires mapping extracted text back to page numbers during chunking
- Add `page_number` to chunks, reference in summary prompt

### Diagrams
- Mind maps (SVG-based, custom renderer)
- Flowcharts (Mermaid.js integration)
- LLM generates structured diagram description in the summary
- Render with mermaid or custom component
- Significant UI work — custom renderers, zoom/pan, styling

### Export
- Copy summary to clipboard
- Download as PDF or markdown file
- Share link

### Multi-document Summary
- Summarize across all documents in a subject
- Useful for exam prep — "summarize everything in this subject"

---

## Dependencies
- `react-markdown` — markdown rendering
- `remark-gfm` — GitHub Flavored Markdown (tables, etc.)
- New DB table: `document_summaries`
- New API route: `/api/summary`
