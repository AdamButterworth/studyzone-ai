# Feature Plans

Status of each feature on the document page right panel.

| Feature | V1 Status | Description |
|---|---|---|
| [Chat](chat.md) | ✅ Done | RAG-powered Q&A from document |
| [Summary](summary.md) | ✅ Done | One-click document summary with markdown |
| [Lesson Plan](lesson-plan.md) | 📋 Planned | Per-doc + subject-level structured study plans |
| [Notes](notes.md) | 📋 Planned | Simple note persistence per document |
| [Markdown Rendering](markdown-rendering.md) | 📋 TODO | Markdown in chat, LaTeX, code highlighting |
| [Highlight Actions](highlight-actions.md) | 📋 TODO | Select PDF text → ask, save to notes, highlight |
| [UI Polish](ui-polish.md) | 📋 TODO | Brighter, larger fonts, breathing room (NotebookLM reference) |

## Build order
1. ~~Chat~~ ✅
2. ~~Summary~~ ✅
3. **Markdown in chat** ← next quick win
4. Notes (quick — just DB persistence)
5. Lesson Plan
