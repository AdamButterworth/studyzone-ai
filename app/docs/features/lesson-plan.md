# Lesson Plan Feature Plan

## Overview
AI-generated guided learning plans — at document level and subject level. The key differentiator: subject-level lesson plans analyse ALL documents in a subject, identify themes, order topics by dependency, and create a structured curriculum.

---

## V1: Per-Document Lesson Plan

### Generation
- **Technique:** Single-shot — send full `raw_text` to Gemini Flash
- **Prompt:** "Create a step-by-step guided lesson plan for studying this document"
- **Output format:** JSON array of steps, each with:
  - `title` — topic name
  - `time` — estimated minutes
  - `description` — what to learn/do
- **Model:** Gemini 3 Flash

### Storage
- Store in `generated_content` table with `type = 'lesson_plan'`
- One lesson plan per document, cached, regenerable

### UI
- Current UI structure already exists (checklist with progress bar)
- Replace mock data with real generated steps
- "Start Guided Lesson" button — future: opens interactive lesson mode

### Cost
- ~$0.002-0.01 per generation (same as summary)

---

## V2: Subject-Level Lesson Plan (Key Feature)

### Concept
For a given subject (e.g. "CS224R — Reinforcement Learning"), the system:
1. Takes ALL indexed documents in the subject
2. Analyses them holistically — identifies topics, themes, prerequisites
3. Organises them into a structured learning plan
4. Breaks each topic into actionable study steps
5. Maps steps back to specific documents/sections

### How It Works

**Input:** All `raw_text` + summaries from documents in the subject

**Processing:**
1. **Topic extraction** — identify the key topics across all documents
   - Use embeddings to cluster related chunks across docs
   - Or send summaries of all docs to Gemini and ask it to identify themes
2. **Dependency ordering** — figure out what should be learned first
   - "You need to understand Policy Gradients before PPO"
   - "Read the basics paper before the advanced one"
3. **Curriculum generation** — structure into modules/weeks/phases
4. **Step generation** — break each module into concrete actionable steps

**Output structure:**
```json
{
  "title": "CS224R — Reinforcement Learning Study Plan",
  "estimated_hours": 12,
  "modules": [
    {
      "title": "Module 1: Foundations",
      "estimated_time": "3 hours",
      "prerequisites": [],
      "steps": [
        {
          "title": "Read: Policy Gradient Methods — Introduction",
          "time": "15 min",
          "description": "Understand why direct policy optimization matters",
          "document_id": "abc-123",
          "document_title": "Policy Gradient Methods",
          "action": "read",
          "sections": "Sections 1-2"
        },
        {
          "title": "Quiz: Policy gradient basics",
          "time": "10 min",
          "description": "Test your understanding of the score function",
          "action": "quiz",
          "topics": ["score function", "REINFORCE"]
        },
        {
          "title": "Read: Variance Reduction with Baselines",
          "time": "20 min",
          "description": "Learn how baselines reduce variance without bias",
          "document_id": "abc-123",
          "action": "read",
          "sections": "Sections 3-4"
        }
      ]
    },
    {
      "title": "Module 2: Advanced Methods",
      "estimated_time": "4 hours",
      "prerequisites": ["Module 1"],
      "steps": [...]
    }
  ]
}
```

### Step Action Types
- **read** — "Read sections X-Y of [document]" with link to the doc
- **quiz** — "Test yourself on [topics]" (generate quiz questions)
- **review** — "Review your notes on [topic]" 
- **practice** — "Try to explain [concept] in your own words"
- **compare** — "Compare [concept A] from [doc 1] with [concept B] from [doc 2]"
- **summarize** — "Write a summary of [module] in your own words"

### UI: Subject Page
- New "Study Plan" button/tab on the subject page (not just document page)
- Shows the full curriculum as a vertical timeline/checklist
- Each module is collapsible
- Steps within modules are checkable (track progress)
- Progress bar at the top ("4/18 steps complete — 22% done")
- Steps link to specific documents — clicking opens the doc at the right section
- "Generate Study Plan" button when no plan exists
- "Regenerate" when documents are added/removed

### UI: Progress Tracking
- Checkmarks persist across sessions (stored in `learning_progress` table — already in schema)
- Show estimated time remaining
- "Resume" button that scrolls to the next incomplete step
- Optional: daily goals ("Complete 3 steps today")

### Storage
- `subject_lesson_plans` table:
  - `id`, `subject_id`, `user_id`, `content` (JSONB), `created_at`
- Or reuse `generated_content` with `type = 'subject_lesson_plan'` and a `subject_id` field
- Progress tracked in existing `learning_progress` table

### Smart Features (V2+)
- **Auto-update** when new documents are added to the subject
- **Adaptive ordering** — if the user already knows topic X (quiz performance), skip or condense it
- **Exam mode** — "I have an exam in 3 days, optimize my study plan"
- **Spaced repetition** — revisit topics at optimal intervals
- **Collaborative** — share lesson plans with classmates

---

## V3: Interactive Lessons

### Per-Step Experience
- Click a "read" step → opens the document at the relevant section
- Click a "quiz" step → AI generates 3-5 questions from that topic's chunks
  - Multiple choice, fill-in-the-blank, short answer
  - Immediate feedback with explanations
- Click a "practice" step → guided exercise with AI as tutor
- Track score/performance per step

### Adaptive Difficulty
- Assess understanding via quiz performance
- Adjust lesson depth — skip what's known, dive deeper on gaps
- "You got 2/5 on baselines — let me explain this differently"

---

## Technical Considerations

### Subject-level plan generation
- Can't fit all raw_text from all docs in one prompt for large subjects
- Approach: send *summaries* of all docs (not raw_text) + chunk-level topic keywords
- Or use map-reduce: generate per-doc topic lists → merge into curriculum
- The `match_chunks` function with `match_subject_id` already supports cross-doc search

### Keeping plans in sync
- When a new doc is added to a subject, mark the lesson plan as "stale"
- Show a banner: "New content added — regenerate your study plan?"
- Don't auto-regenerate (expensive), let the user choose

### Cost
- Subject-level plan: ~$0.01-0.05 (depends on number of docs/summaries)
- Per-step quiz generation: ~$0.002 per quiz
- Manageable at scale

---

## Dependencies
- All documents in subject must be indexed (have embeddings)
- Summaries help but aren't required (can use raw_text chunks)
- `learning_progress` table already exists in schema
- New: `subject_lesson_plans` table or expand `generated_content`
- New: Subject page UI for study plan view
