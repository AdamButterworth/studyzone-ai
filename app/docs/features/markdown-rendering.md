# Markdown & LaTeX Rendering TODO

## Problem
Chat responses and summaries contain markdown formatting (bold, lists, code blocks, headers) and sometimes LaTeX equations, but:
- **Chat** renders as plain text (`whitespace-pre-wrap`) — no markdown parsing
- **Summary** uses `react-markdown` + `remark-gfm` — works for markdown but not LaTeX

## What's needed

### V1 — Markdown in Chat
- Apply `react-markdown` + `remark-gfm` to chat AI messages (same as summary)
- Reuse `.prose-summary` styles or create `.prose-chat` variant
- Only apply to AI messages (user messages stay as plain text bubbles)
- Handle inline code, code blocks, bold, italic, lists, tables

### V2 — LaTeX / Math
- Add `remark-math` + `rehype-katex` (or `rehype-mathjax`) plugins
- Renders `$inline$` and `$$block$$` LaTeX equations
- Needed for STEM documents (physics, math, CS theory papers)
- Affects both chat and summary rendering

### V3 — Code blocks with syntax highlighting
- Add `rehype-highlight` or `react-syntax-highlighter`
- Language-aware syntax coloring
- Copy button on code blocks

## Example of current broken rendering
```
Based on the document, **τ-bench** is an evaluation framework...
*   **Simulated Environment:** It uses a backend...
```
Shows literal `**` and `*` instead of bold and bullets.

## Files to modify
- `src/app/(dashboard)/subject/[id]/doc/[docId]/page.tsx` — chat message rendering
- `src/app/globals.css` — add `.prose-chat` styles
- `package.json` — add `remark-math`, `rehype-katex` (for v2)
