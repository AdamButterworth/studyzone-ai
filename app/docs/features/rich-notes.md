# Rich Notes TODO (P1)

## Overview
Enhance notes beyond text — support images, source-linked quotes, and drag-and-drop from PDF.

---

## 1. Images in Notes

### Paste / Upload
- Paste images from clipboard into the Tiptap editor
- Upload button in toolbar to insert images
- Images stored in Supabase Storage (`notes-images/` bucket)
- Tiptap `@tiptap/extension-image` handles rendering

### Drag from PDF
- Drag a region/screenshot from the PDF into the notes editor
- On drop: capture the visible area as an image (canvas snapshot)
- Upload to storage, insert into note at drop position
- Technically: listen for drag events on notes editor, capture from PDF canvas

### Technical
- Install `@tiptap/extension-image`
- Storage bucket for note images
- Paste handler: `editor.on('paste', ...)` to intercept image pastes
- Drag handler: custom drop zone in Tiptap

---

## 2. Source-Linked Quotes

### What it does
When you add text from a PDF to a note (via highlight → "Add to note"), the quote should:
- Include a link back to the source document + page number
- Clicking the link navigates to that document at that page
- Styled as a blockquote with a small source badge

### Current behavior
- Text is added as a plain `<blockquote>` with no source info

### What to change
- When adding from PDF selection, include metadata:
  - `document_id`
  - `document_title`
  - `page_number` (from `data-page` attribute on the selection's parent)
- Store as a custom Tiptap node or as HTML data attributes:
  ```html
  <blockquote data-source-doc="uuid" data-source-page="5" data-source-title="Policy Gradients">
    <p>The selected text...</p>
    <cite><a href="/subject/{id}/doc/{docId}?page=5">Policy Gradients, p.5</a></cite>
  </blockquote>
  ```
- Clicking the cite link navigates to the doc and scrolls to that page

### Technical
- Extract page number from DOM: `selection.anchorNode.closest('[data-page]').dataset.page`
- Custom Tiptap node for source-linked blockquotes
- Or simpler: just append a plain text cite line with a link

---

## 3. Drag from PDF to Notes

### Flow
1. User selects/highlights text in PDF
2. Drags it toward the notes panel
3. Notes editor accepts the drop
4. Text inserted at drop position (with source link)

### Alternative (simpler for v1)
- Don't implement real drag-and-drop
- Instead, the existing "Add to note" button from the selection toolbar is sufficient
- Drag-and-drop is a v2 nicety

---

## Implementation priority
1. **Source-linked quotes** — modify existing "Add to note" flow to include doc + page reference
2. **Paste images** — Tiptap image extension + clipboard handler
3. **Upload images** — toolbar button + storage
4. **Drag from PDF** — v2, complex interaction

## Files affected
- `src/components/app/NoteEditor.tsx` — image extension, custom blockquote
- `src/components/app/SelectionToolbar.tsx` — pass page number with selection
- `src/app/(dashboard)/subject/[id]/doc/[docId]/page.tsx` — extract page from selection
- New: storage bucket for note images
