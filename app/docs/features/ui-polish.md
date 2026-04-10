# UI/UX Polish TODO

## Reference
Google NotebookLM — brighter, more spacious, clearer panel boundaries.

## Problems with current UI
- PDF reader panel feels cramped
- Text/fonts feel small across the document page
- Panel boundaries between PDF viewer and AI panel are subtle/invisible
- Right panel (AI tools) feels dense
- Overall tone is slightly muted — could be brighter

## Changes needed

### Typography
- Increase base font sizes across the document page (13px → 14-15px)
- Chat messages: larger text, more line height
- Summary rendering: slightly larger headings
- Toolbar text: bump from 12px to 13px
- Breadcrumb bar: ensure readability

### Spacing & Breathing Room
- More padding inside the AI panel (px-5 → px-6, py gaps between sections)
- Chat bubbles: more padding, more gap between messages
- Summary: more margin between sections
- Tab bar: slightly taller, more padding

### Panel Structure
- Clearer visual boundary between PDF viewer and AI panel
- Consider a subtle border or different background shade for the right panel
- Panel headers should feel more distinct (slightly bolder section labels)

### Brightness / Tone
- Lighten the PDF viewer background slightly (current `#EEEAE5` → brighter)
- Right panel could use a very subtle warm tint vs pure white
- More contrast on interactive elements (buttons, inputs)

### Reference: NotebookLM patterns
- Three distinct panels with clear white backgrounds + subtle borders
- Generous padding (16-24px inside panels)
- Clean typography hierarchy (title → subtitle → body)
- Rounded cards with visible but subtle shadows
- Bright, airy feel overall

## Files to modify
- `src/app/(dashboard)/subject/[id]/doc/[docId]/page.tsx` — main document page layout
- `src/app/globals.css` — prose styles, base font adjustments
- `src/components/app/PdfViewer.tsx` — viewer background color
- Possibly `src/app/(dashboard)/layout.tsx` — overall layout spacing

## Priority
Medium — functional features come first, but this significantly improves perceived quality.
