# Feature Plans

## Done
| Feature | Description |
|---|---|
| [Chat](chat.md) | RAG-powered Q&A, streaming, persisted threads, markdown rendering |
| [Summary](summary.md) | One-click AI summary, cached, regenerable, markdown |
| [Notes](notes.md) | Tiptap rich text editor, multiple notes per doc, auto-save |
| [Highlight Actions](highlight-actions.md) | PDF text selection → Ask / Add to note / Copy toolbar |
| Chat persistence | Threads saved to DB, resume from My Resources |
| PDF viewer | Upload, render, zoom, search, fullscreen, progressive loading |
| Document processing | Edge Function: extract text, chunk, embed (pgvector) |
| Upload pipeline | Two-phase upload, processing toast, auto-navigate to doc |

## TODO (prioritized)

| # | Feature | Priority | Description |
|---|---|---|---|
| 1 | [Multi-Format Content](multi-format-content.md) | **P0** | YouTube videos, PowerPoint, Word docs, images, audio |
| 2 | [Resource Organisation](resource-organisation.md) | **P0** | Filter chips on My Resources, subject-level resource view, cross-doc notes |
| 3 | [Lesson Plan](lesson-plan.md) | **P0** | Per-doc + subject-level structured study plans |
| 4 | Flashcards | **P0** | AI-generated study cards from document content |
| 5 | Quiz | **P0** | AI-generated test questions with answers + explanations |
| 3 | [Markdown Rendering](markdown-rendering.md) | P1 | LaTeX/math in chat + summary + notes, code highlighting |
| 4 | Copy AI replies to notes | P1 | Hover button on AI messages → add to note |
| 5 | Reply to specific part | P1 | Select text in AI response → follow-up or copy to note |
| 6 | [Rich Notes](rich-notes.md) | P1 | Images in notes, source-linked quotes, drag from PDF |
| 7 | [PDF Stability](pdf-stability.md) | P1 | Smooth loading, no reload on nav, no jump on resize |
| 7 | [UI Polish](ui-polish.md) | P2 | Ongoing — mobile, animations, polish |
| 7 | Upload from dashboard | P2 | Upload PDF from main page (auto-create subject) |
| 8 | Mobile responsiveness | P2 | Document page needs mobile layout |
| 9 | Persistent highlights | P3 | Save highlighted regions on PDF, color-coded |
| 10 | Floating notes | P3 | Draggable note overlay on PDF |
| 11 | Export | P3 | Copy/download notes, summaries as markdown/PDF |
