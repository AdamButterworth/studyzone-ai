# Blog Cover Image Prompts

Generate each image at **1200x750px** (16:10 ratio). Save to the path listed — the blog page will reference these.

---

## Save Directory

All images go in: `app/public/blog/`

---

## 1. Why Most AI Study Tools Get It Wrong

**File**: `app/public/blog/ai-tools-wrong.jpg`
**Slug**: `why-most-ai-study-tools-get-it-wrong`
**Series**: AI & Learning

**Prompt**: A student sitting at a desk surrounded by floating holographic AI summary cards that are fading away and dissolving, while a single glowing book remains solid in the center. Soft purple and indigo tones. Minimal, editorial illustration style. Clean background with subtle gradient. No text.

---

## 2. First Principles Learning: What the Research Says

**File**: `app/public/blog/first-principles.jpg`
**Slug**: `first-principles-learning`
**Series**: AI & Learning

**Prompt**: Abstract illustration of a tree growing upward where the roots are labeled concepts and the branches become more complex structures. Deep violet to purple gradient background. Geometric, modern flat illustration style. Glowing nodes at branch intersections. No text.

---

## 3. Reading to Understand vs. Reading to Finish

**File**: `app/public/blog/reading-to-understand.jpg`
**Slug**: `reading-to-understand-vs-reading-to-finish`
**Series**: How People Learn

**Prompt**: Split composition — left side shows a person speed-reading through a blur of pages, right side shows someone with a magnifying glass examining a single illuminated page with highlighted concepts floating off it. Blue and cyan tones. Clean editorial illustration. No text.

---

## 4. How to Study Machine Learning from Scratch

**File**: `app/public/blog/ml-from-scratch.jpg`
**Slug**: `how-to-study-machine-learning-from-scratch`
**Series**: Study Guides

**Prompt**: A winding path going up a mountain, with milestones along the way showing mathematical symbols (matrices, gradients, neural network nodes). Emerald green to teal gradient background. Isometric style illustration. Warm lighting at the summit. No text.

---

## 5. The Study Schedule That Actually Works

**File**: `app/public/blog/study-schedule.jpg`
**Slug**: `the-study-schedule-that-actually-works`
**Series**: Student Life

**Prompt**: A beautifully organized desk from above with a clean weekly planner, a cup of coffee, a laptop, and color-coded sticky notes. Warm amber and orange tones. Flat lay photography style illustration. Soft shadows, cozy feel. No text.

---

## 6. How AI Tutors Are Outperforming Traditional Study Methods

**File**: `app/public/blog/ai-tutors-outperform.jpg`
**Slug**: `how-ai-tutors-outperform-traditional-study`
**Series**: AI & Learning

**Prompt**: A student having a conversation with a friendly glowing AI figure, with concept maps and knowledge graphs floating between them. Purple to pink gradient background. Futuristic but warm illustration style. Soft particle effects. No text.

---

## 7. YouTube University: How to Actually Learn from Video Content

**File**: `app/public/blog/youtube-learning.jpg`
**Slug**: `youtube-university-how-to-actually-learn-from-video`
**Series**: How People Learn

**Prompt**: A laptop screen showing a video lecture with key concepts being extracted and organized into floating note cards beside it. Sky blue to deeper blue gradient. Modern flat illustration with subtle 3D depth. Clean lines. No text.

---

## 8. Flashcards Done Right: Beyond Brute-Force Memorization

**File**: `app/public/blog/flashcards-done-right.jpg`
**Slug**: `flashcards-done-right`
**Series**: How People Learn

**Prompt**: A stack of beautifully designed flashcards fanning out, some glowing with connected lines between them showing concept relationships. Cyan to teal gradient. Minimal, clean illustration with soft shadows. Some cards have abstract symbols. No text.

---

## 9. How to Prepare for Finals in One Week (Realistically)

**File**: `app/public/blog/finals-one-week.jpg`
**Slug**: `how-to-prepare-for-finals-in-one-week`
**Series**: Student Life

**Prompt**: A calendar showing 7 days with a focused student working through a structured plan, each day color-coded with different study activities. Warm amber to rose gradient. Slightly whimsical illustration style with clean geometric shapes. No text.

---

## Slug → Image Mapping (for code reference)

```typescript
const blogImages: Record<string, string> = {
  "why-most-ai-study-tools-get-it-wrong": "/blog/ai-tools-wrong.jpg",
  "first-principles-learning": "/blog/first-principles.jpg",
  "reading-to-understand-vs-reading-to-finish": "/blog/reading-to-understand.jpg",
  "how-to-study-machine-learning-from-scratch": "/blog/ml-from-scratch.jpg",
  "the-study-schedule-that-actually-works": "/blog/study-schedule.jpg",
  "how-ai-tutors-outperform-traditional-study": "/blog/ai-tutors-outperform.jpg",
  "youtube-university-how-to-actually-learn-from-video": "/blog/youtube-learning.jpg",
  "flashcards-done-right": "/blog/flashcards-done-right.jpg",
  "how-to-prepare-for-finals-in-one-week": "/blog/finals-one-week.jpg",
};
```
