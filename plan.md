# StudyZone AI - Product & Implementation Plan

## Vision

A learning platform where users upload their study materials and get a **guided, first-principles learning experience** — not just content summarization. The key differentiator from tools like YouLearn is that StudyZone AI acts as a tutor that builds understanding from the ground up, rather than letting users passively read through materials.

## Key Differentiator

YouLearn treats each piece of content as standalone — you upload a doc, get a summary, quiz, etc. **StudyZone AI creates a structured learning path** across your materials, identifies prerequisite concepts, and guides you through them in the right order. It's the difference between "here's a summary of your notes" and "let me teach you this topic step by step."

---

## V1 Scope

### Core Concept: Learning Paths

Users create **Learning Paths** (similar to YouLearn's "Spaces") focused on a single topic (e.g., "Reinforcement Learning"). Within a path, they upload materials and get a guided learning experience.

### Information Architecture

```
App
├── Sidebar (collapsible)
│   ├── + New Learning Path
│   ├── Search
│   ├── Recent
│   └── Learning Paths list
│       └── Each path expands to show uploaded content
├── Main Area
│   ├── Learning Path home (when no content selected)
│   │   ├── Path name, icon, cover, description
│   │   ├── "Ready to learn?" prompt
│   │   ├── Content upload options (file, link, paste text)
│   │   ├── "Learn anything" search bar
│   │   └── Uploaded content list
│   └── Content view (when content is selected)
│       ├── Left panel: Document/content viewer
│       └── Right panel: AI learning tools
```

---

## Features (V1)

### 1. Learning Paths (MVP)
- Create, rename, delete learning paths
- Add icon and cover image
- Add description
- List view and grid view toggle for content within a path

### 2. Content Upload
- **File upload**: PDF, DOCX, PPTX, TXT, MD (start with max ~10MB)
- **Paste text**: Free-form text input
- **Link**: URL to a webpage (scrape and extract content)
- Upload progress indicator
- Content appears in a list at the bottom of the path page

### 3. Content Viewer (Left Panel)
- Render uploaded documents (PDF viewer, text/markdown renderer)
- Page navigation for multi-page docs
- **Text selection toolbar**: When user highlights text, show floating toolbar with:
  - Explain
  - Chat about this
  - Quiz me on this
  - Create flashcards
  - Add a note
  - Highlight

### 4. AI Learning Panel (Right Panel)
The core differentiator. When a content item is open, the right panel provides:

#### Generate Widgets
- **Summary**: Structured summary with key concepts identified
- **Quiz**: Generate questions that test understanding (multiple choice + free response)
- **Flashcards**: Key term/concept flashcard sets
- **Notes**: AI-generated study notes
- **Lesson Plan**: Break the content into a structured sequence of concepts to learn, ordered from foundational to advanced

#### First-Principles Guide (Key Differentiator)
- **Concept Map**: AI identifies all concepts in the material and their prerequisites
- **Guided Learning Mode**: Instead of just showing the document, walk the user through concepts one by one:
  1. Identify what the user needs to understand first
  2. Explain foundational concepts before building up
  3. Check understanding with inline questions
  4. Only advance when the user demonstrates comprehension
- **"Teach me this"**: User can point at any section and get a first-principles explanation

#### Chat
- Ask questions about the content
- Context-aware (knows what document is open, what section the user is viewing)
- Can reference specific parts of the uploaded material

### 5. Sidebar
- Collapsible
- List of all learning paths
- Each path expandable to show its content items
- Quick access to create new path

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI (formerly NextUI) — modern, distinctive look with built-in animations, built on React Aria + Tailwind
- **State Management**: React Context + hooks (upgrade to Zustand if needed)
- **PDF Rendering**: react-pdf or pdf.js
- **Rich Text**: Markdown rendering with react-markdown
- **File Upload**: react-dropzone

### Backend
- **API**: Next.js API routes (start simple, extract to separate backend if needed)
- **Database**: PostgreSQL via Supabase (auth + db + storage in one)
- **File Storage**: Supabase Storage (for uploaded files)
- **AI/LLM**: Claude API (Anthropic) for all AI features
- **Document Parsing**: 
  - PDF: pdf-parse
  - DOCX: mammoth
  - Web scraping: cheerio or Mozilla Readability

### Auth
- Supabase Auth (email/password to start, Google OAuth later)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Basic app shell with auth and navigation

- [ ] Initialize Next.js project with TypeScript, Tailwind, HeroUI
- [ ] Set up Supabase project (auth, database, storage)
- [ ] Database schema: `users`, `learning_paths`, `content_items`
- [ ] Auth flow: sign up, sign in, sign out
- [ ] App layout: collapsible sidebar + main content area
- [ ] Landing/home page (list of learning paths)

### Phase 2: Learning Paths & Content Upload (Week 2)
**Goal**: Users can create paths and upload content

- [ ] Create/edit/delete learning paths
- [ ] Learning path home page (name, description, icon)
- [ ] File upload flow (drag & drop, progress bar, size limits)
- [ ] Paste text flow
- [ ] URL link input (basic — just store the URL for now)
- [ ] Content list within a learning path
- [ ] Document parsing pipeline (extract text from PDF, DOCX, etc.)
- [ ] Store parsed text content in database for AI processing

### Phase 3: Content Viewer (Week 3)
**Goal**: View uploaded documents with text selection

- [ ] PDF viewer component (left panel)
- [ ] Text/Markdown viewer component
- [ ] Split-panel layout (content left, AI tools right)
- [ ] Text selection detection + floating toolbar
- [ ] Basic highlight functionality

### Phase 4: AI Features (Week 3-4)
**Goal**: Core AI-powered learning tools

- [ ] Claude API integration (server-side)
- [ ] Chat interface (right panel) — ask questions about the content
- [ ] Summary generation
- [ ] Quiz generation (multiple choice + free response)
- [ ] Flashcard generation
- [ ] Notes generation
- [ ] "Explain this" from text selection
- [ ] Streaming responses for all AI features

### Phase 5: First-Principles Learning (Week 4-5)
**Goal**: The key differentiator — guided learning

- [ ] Lesson plan generation: break content into ordered concepts
- [ ] Concept dependency mapping (what to learn first)
- [ ] Guided learning mode: step-by-step walkthrough
- [ ] Inline comprehension checks
- [ ] Progress tracking per learning path
- [ ] "Teach me this" for any selected text — explain from foundations

### Phase 6: Polish & UX (Week 5-6)
- [ ] Responsive design / mobile-friendly
- [ ] Loading states and skeletons
- [ ] Error handling and edge cases
- [ ] Content search within a path
- [ ] Sidebar: recent items, search across all paths
- [ ] Keyboard shortcuts

---

## Database Schema (V1)

```sql
-- Users (managed by Supabase Auth, extend with profile)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Learning Paths (like "Spaces" in YouLearn)
create table learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null default 'Untitled Path',
  description text,
  icon text,  -- emoji or icon identifier
  cover_url text,  -- cover image URL
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Content items within a learning path
create table content_items (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid references learning_paths(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  type text not null,  -- 'pdf', 'docx', 'text', 'link', 'pptx'
  file_url text,  -- Supabase Storage URL (for uploaded files)
  source_url text,  -- original URL (for links)
  raw_text text,  -- extracted/parsed text content
  metadata jsonb default '{}',  -- page count, word count, etc.
  created_at timestamptz default now()
);

-- AI-generated content (summaries, quizzes, flashcards, etc.)
create table generated_content (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references content_items(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,  -- 'summary', 'quiz', 'flashcards', 'notes', 'lesson_plan'
  data jsonb not null,  -- structured output from AI
  created_at timestamptz default now()
);

-- Chat messages
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references content_items(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null,  -- 'user' or 'assistant'
  content text not null,
  created_at timestamptz default now()
);

-- User highlights and notes
create table highlights (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references content_items(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  selected_text text not null,
  note text,  -- user's note on the highlight
  page_number int,
  position jsonb,  -- text position data for re-rendering
  created_at timestamptz default now()
);

-- Learning progress tracking
create table learning_progress (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid references learning_paths(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  lesson_plan_id uuid references generated_content(id),
  current_step int default 0,
  completed_steps jsonb default '[]',  -- array of step indices
  quiz_scores jsonb default '{}',
  updated_at timestamptz default now()
);
```

---

## Site Pages Plan

### What YouLearn Has (for reference)
| Page | Purpose |
|------|---------|
| `/` Landing page | Hero, features, use cases, testimonials, FAQ, footer |
| `/youtube-video-summarizer` | SEO feature page for YouTube summarization |
| `/app` | The actual product (behind auth) |
| `/careers` | 3 open roles, company mission |
| `/blogs` | ~20 SEO blog posts, chronological list |
| `/blogs/[slug]` | Individual blog posts (study tips, AI tools comparisons) |
| `/terms-conditions` | 32-section legal doc |
| `/privacy-policy` | 16-section privacy doc |

### StudyZone AI Pages (V1)

#### Public Pages (marketing site)

**1. Landing Page (`/`)**
- **Nav**: Logo, Features, Pricing, Blog, Sign In, "Get Started" CTA
- **Hero Section**:
  - Headline: something like "Learn anything from first principles"
  - Subheadline: emphasize the guided learning differentiator, not just "summarize your notes"
  - Primary CTA: "Start Learning" → sign up
  - Secondary CTA: "See how it works" → scroll to demo
  - Social proof badge (user count once we have it, or "Built by Stanford students" for early credibility)
- **Problem/Solution Section**:
  - Problem: "You have the notes, but no guide. AI tools summarize — they don't teach."
  - Solution: "StudyZone builds you a learning path from first principles, so you actually understand."
- **Feature Showcase** (3-4 cards with visuals/animations):
  1. **Upload anything** — PDFs, slides, notes, links, pasted text
  2. **AI builds your learning plan** — concepts ordered from foundational to advanced
  3. **Learn step by step** — guided mode with explanations and comprehension checks
  4. **Quiz, flashcards, notes** — all the study tools, generated from your materials
- **How It Works** (3-step visual flow):
  1. Create a learning path & upload your materials
  2. AI analyzes concepts and builds a structured lesson plan
  3. Learn with a guided tutor that checks your understanding
- **Demo/Screenshot Section**: Interactive preview or animated walkthrough of the product
- **Testimonials**: 4-6 cards (placeholder initially, real ones once we have users)
- **FAQ Section**: 5-6 common questions (expandable accordion)
  - What is StudyZone AI?
  - How is this different from ChatGPT / YouLearn?
  - What file types can I upload?
  - Is it free?
  - How does the guided learning work?
  - Is my data private?
- **Footer**:
  - Product: Features, Pricing, Blog
  - Company: About, Careers, Contact
  - Legal: Terms, Privacy Policy
  - Social: Twitter/X, Discord, GitHub

**2. Pricing Page (`/pricing`)**
- Free tier vs Pro tier comparison table
- V1: Just "Free during beta" with a waitlist or direct sign-up
- Feature comparison grid for when we add a paid tier

**3. Blog (`/blog`)**
- Blog index page with post cards (title, date, excerpt, cover image)
- Individual post pages (`/blog/[slug]`)
- V1: Start with 3-5 SEO posts:
  - "How to actually learn from your notes (not just re-read them)"
  - "AI study tools compared: what works and what doesn't"
  - "First-principles learning: why it matters and how to do it"
- Use MDX or a CMS (can start with MDX files in the repo)

**4. Legal Pages**
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- Can use standard templates initially, customize later

#### Auth Pages

**5. Sign In (`/sign-in`)**
- Email/password form
- Google OAuth button (V1.1)
- Link to sign up

**6. Sign Up (`/sign-up`)**
- Email/password form
- Google OAuth button (V1.1)
- Link to sign in

#### Product Pages (behind auth)

**7. Dashboard / Home (`/app`)**
- Welcome message ("Ready to learn, [Name]?")
- List/grid of user's learning paths
- "Create new learning path" prominent CTA
- Recent activity (last opened content)

**8. Learning Path Page (`/app/path/[id]`)**
- Path name, icon, cover, description (editable)
- Content upload area (drag & drop, link, paste text)
- Content list (uploaded items with name, type, date)
- "Start Learning" button (launches guided mode for the whole path)

**9. Content Viewer (`/app/path/[id]/content/[contentId]`)**
- Split-panel layout:
  - **Left**: Document viewer (PDF renderer, markdown/text viewer)
  - **Right**: AI learning panel (chat, generate widgets, guided mode)
- Text selection toolbar (explain, quiz, flashcards, note, highlight)
- Top bar: breadcrumb (Path name > Content name), navigation

**10. Settings (`/app/settings`)**
- Profile (name, email, avatar)
- Account management
- Preferences (theme, default AI behavior)

### Page Priority for Implementation

| Priority | Page | Why |
|----------|------|-----|
| P0 | Landing page | First thing users see, needed for any launch |
| P0 | Sign up / Sign in | Can't use the product without auth |
| P0 | Dashboard (`/app`) | Entry point after login |
| P0 | Learning Path page | Core product flow |
| P0 | Content Viewer | Where the actual learning happens |
| P1 | Pricing | Needed before any monetization |
| P1 | Settings | Users expect basic account management |
| P2 | Blog | SEO play, not critical for launch |
| P2 | Legal pages | Needed before public launch but can use templates |
| P3 | Careers | Only when hiring |

---

## Future (V2+)

- **Search & Research**: Find relevant resources online for a topic, auto-build a learning path
- **Audio/Video support**: YouTube links, lecture recordings, podcast episodes
- **Podcast generation**: Convert content to audio explanations
- **Video generation**: Short explainer videos
- **Spaced repetition**: Schedule flashcard reviews based on forgetting curves
- **Collaborative paths**: Share learning paths with others
- **LMS integrations**: Import from Canvas, D2L, etc.
- **Chrome extension**: Save web content directly to a learning path
- **Mobile app**
