# Markdown & LaTeX Rendering TODO

## Status
- Chat markdown: ✅ Done (react-markdown + prose-chat styles)
- Summary markdown: ✅ Done (react-markdown + prose-summary styles)
- LaTeX: ❌ Not done
- Code highlighting: ❌ Not done

## Next: LaTeX / Math (P1 for tomorrow)
- Add `remark-math` + `rehype-katex` plugins
- Renders `$inline$` and `$$block$$` LaTeX equations
- Apply to: chat messages, summary, AND notes editor
- Needed for STEM documents (physics, math, CS theory papers)
- Example currently broken in summary: `$r^{int}_t$` shows as literal text

### Files to modify
- `src/app/(dashboard)/subject/[id]/doc/[docId]/page.tsx` — chat + summary rendering
- `src/components/app/NoteEditor.tsx` — Tiptap math extension
- `src/app/globals.css` — KaTeX styles
- `package.json` — add `remark-math`, `rehype-katex`, `katex`

## Next: Code blocks with syntax highlighting
- Add `rehype-highlight` or `react-syntax-highlighter`
- Language-aware syntax coloring
- Copy button on code blocks

## Next: Copy AI replies to notes / reply to specific part

### Copy to notes
- Each AI chat message gets a "Copy to note" button (on hover)
- Clicking it appends the message content to a note (same flow as PDF selection → add to note)
- Uses the same note picker (most recent + dropdown)

### Reply to specific part
- Select text within an AI response
- Show a mini toolbar: "Ask follow-up" / "Copy to note" / "Copy"
- "Ask follow-up" pre-fills the chat input with the selected text as a quote
- Similar to the PDF selection toolbar but for chat messages
