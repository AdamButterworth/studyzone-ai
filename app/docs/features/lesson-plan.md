# Lesson Plan Feature Plan

## Overview
AI-generated guided lesson from the document. Step-by-step learning path with time estimates.

---

## V1 (Next)

### Generation
- **Technique:** Single-shot — send full `raw_text` to Gemini Flash
- **Prompt:** "Create a step-by-step guided lesson plan for studying this document"
- **Output format:** JSON array of steps, each with:
  - `title` — topic name
  - `time` — estimated minutes
  - `description` — what to learn/do
- **Model:** Gemini 3 Flash

### Storage
- New `document_lesson_plans` table or column on `document_summaries`
- One lesson plan per document, cached
- Regenerable

### UI
- Current UI structure already exists (checklist with progress bar)
- Replace mock data with real generated steps
- "Start Guided Lesson" button — future: opens interactive lesson mode

### Cost
- ~$0.002-0.01 per generation (same as summary)

---

## V2 (Later)

### Interactive Lessons
- Click a step → AI teaches that topic using the document
- Quiz questions between steps
- Track completion across sessions

### Adaptive difficulty
- Assess understanding via quiz performance
- Adjust lesson depth — skip what's known, dive deeper on gaps

### Multi-document lessons
- Lesson plan spanning multiple docs in a subject
- Exam prep mode — "create a lesson plan for the final exam"
