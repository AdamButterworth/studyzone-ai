# Multi-Format Content Support

## Overview
Students use more than PDFs. Support YouTube videos, PowerPoint, Word docs, images, and audio for a complete study platform.

---

## Priority Order

### 1. YouTube Videos (P0 — highest impact)

**Why:** Students constantly reference lecture videos. Transcript gives free text for RAG/summary.

**Upload flow:**
- Paste YouTube URL in the upload modal (already has a URL input)
- Extract video ID, store as `type = 'youtube'`
- Auto-fetch transcript via YouTube API or `youtube-transcript-api`

**Viewing:**
- Central panel: embedded YouTube player (`<iframe>` with `youtube.com/embed/{id}`)
- Transcript shown below or in a collapsible section
- Timestamp-linked: click a transcript line → video jumps to that time

**AI features:**
- Transcript is the `raw_text` → same chunking/embedding pipeline as PDF
- Chat, summary, lesson plan all work on the transcript
- "What did the professor say about X?" → searches transcript chunks

**Technical:**
- No file storage needed (video hosted on YouTube)
- Transcript extraction: Edge Function or API route
- `documents` table: `type = 'youtube'`, `source_url = YouTube URL`, `raw_text = transcript`

### 2. PowerPoint (.pptx) (P0)

**Why:** Lecture slides are the #1 study material alongside PDFs.

**Upload flow:**
- Upload .pptx file to Supabase Storage
- Edge Function: convert slides to images (one per slide) using `pptx-to-pdf` or `libreoffice` conversion
- Extract text from slides for AI

**Viewing:**
- Central panel: slide viewer (image carousel with prev/next)
- Or convert to PDF and use existing PDF viewer

**AI features:**
- Extracted slide text → same pipeline as PDF
- Summary, chat, notes all work

**Technical approach:**
- Server-side conversion: .pptx → PDF (using `libreoffice` CLI in a cloud function or dedicated microservice)
- Or: .pptx → images + text extraction using `pptxgenjs` or `python-pptx`
- Simpler option: just extract text, show a "slide view not available, download original" message

### 3. Word Documents (.docx) (P1)

**Why:** Common for assignments, readings, handouts.

**Upload flow:**
- Upload .docx to Supabase Storage
- Extract text using `mammoth` (JS library, works in Edge Functions)
- Convert to HTML for viewing

**Viewing:**
- Central panel: rendered HTML (mammoth outputs clean HTML)
- Or convert to PDF server-side

**AI features:**
- Extracted text → same pipeline

### 4. Images (.png, .jpg, .gif) (P1)

**Why:** Diagrams, screenshots of whiteboards, textbook photos.

**Upload flow:**
- Upload image to Supabase Storage
- For AI: OCR with Google Vision API or Gemini vision (multimodal)

**Viewing:**
- Central panel: image viewer with zoom/pan

**AI features:**
- OCR text → raw_text → same pipeline
- Or use Gemini multimodal to describe the image directly

### 5. Audio (.mp3, .m4a) (P2)

**Why:** Lecture recordings.

**Upload flow:**
- Upload audio to Supabase Storage
- Transcribe using Whisper API or Google Speech-to-Text

**Viewing:**
- Central panel: audio player with waveform
- Transcript displayed below with timestamps

**AI features:**
- Transcript → same pipeline as YouTube

### 6. Plain Text / Markdown (.txt, .md) (P2)

**Why:** Notes exports, README files, simple documents.

**Upload flow:**
- Upload file, read content directly
- Store as `raw_text`

**Viewing:**
- Central panel: rendered markdown (already have react-markdown)

---

## Implementation Strategy

### Phase 1: YouTube + URL input
- Wire up the existing "Link" button in upload modal
- Extract YouTube transcript
- Embed player in central panel
- Same AI pipeline on transcript

### Phase 2: PowerPoint
- Accept .pptx uploads
- Server-side text extraction (Edge Function with JS library)
- For viewing: convert to PDF or show extracted text
- Full slide rendering is complex — defer to v2

### Phase 3: Word + Images
- .docx text extraction with mammoth
- Image upload + basic viewer
- OCR for AI is optional v2

### Schema changes needed
- Update upload validation: accept `.pptx`, `.docx`, `.txt`, `.md`, `.png`, `.jpg`
- Update `documents.type` CHECK or remove constraint
- Add `source_url` usage for YouTube
- Central panel: conditional rendering based on `type` (pdf viewer, youtube embed, image viewer, etc.)

### Central panel router
```tsx
{type === "pdf" && <PdfViewer ... />}
{type === "youtube" && <YouTubePlayer url={sourceUrl} />}
{type === "pptx" && <SlideViewer ... />}
{type === "image" && <ImageViewer url={signedUrl} />}
{type === "docx" && <HtmlViewer html={renderedHtml} />}
```

---

## Cost considerations
- YouTube transcript: free (YouTube API)
- Audio transcription: ~$0.006/min with Whisper
- OCR: ~$0.001/image with Google Vision
- PPTX conversion: free (JS libraries) or ~$0.01/doc (cloud conversion)
