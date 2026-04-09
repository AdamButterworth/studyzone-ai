# Text Highlighting & Actions TODO

## Overview
Select text in the PDF viewer to trigger contextual actions. This is a core study workflow — highlight → do something with it.

## Behavior
1. User selects/highlights text in the PDF (text layer already renders selectable text)
2. A floating toolbar appears near the selection
3. Toolbar offers actions on the selected text

## Actions (prioritized)

### V1
- **Ask about this** — opens chat with the highlighted text as context ("Explain this: [selection]")
- **Save to notes** — appends the highlighted text to the document's notes
- **Copy** — standard copy to clipboard

### V2
- **Highlight & persist** — save the highlight with a color (yellow, green, blue, pink)
- Highlights persist across sessions (stored in DB)
- Show saved highlights overlaid on the PDF
- **Summarize this** — send just the selected text for a quick summary
- **Define** — explain a term or concept from the selection

### V3
- **Highlight annotations** — add a note attached to a specific highlight
- **Export highlights** — download all highlights + notes as markdown
- **Highlight colors** — different colors for different purposes (key concepts, questions, important)
- **Sidebar highlight list** — browse all highlights in a scrollable list

## Technical approach

### Floating toolbar
- Listen for `mouseup` / `selectionchange` events on the PDF scroll container
- Get `window.getSelection()` text and bounding rect
- Position a floating div near the selection
- Dismiss on click outside or new selection

### Persistent highlights (V2)
- New `document_highlights` table:
  - `id`, `document_id`, `user_id`, `text`, `page_number`, `position_data` (JSONB for ranges), `color`, `note`, `created_at`
- Render highlight overlays on the text layer using CSS (absolute positioned colored backgrounds)
- Requires mapping selection ranges to stable page/position references

## Files to modify
- `src/components/app/PdfViewer.tsx` — selection detection, floating toolbar
- `src/app/(dashboard)/subject/[id]/doc/[docId]/page.tsx` — wire actions to chat/notes
- New: `src/components/app/SelectionToolbar.tsx` — the floating action bar
- New: DB migration for `document_highlights` (V2)

## Dependencies
- None for V1 (pure DOM selection API)
- DB table for V2 (persistent highlights)
