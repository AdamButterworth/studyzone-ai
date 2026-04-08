# YouLearn Feature Analysis & StudyZone Differentiation Plan

## YouLearn Complete Feature Map

### 1. Dashboard / Home
- **"Ready to learn, [Name]?"** welcome message
- **4 content input methods**: Upload (file), Link (YouTube/website), Paste (text), Record (lecture mic/browser tab)
- **"Learn anything" search bar** — type a topic to learn about without uploading
- **Import from Canvas / D2L** integration
- **Spaces section** — grid of spaces with "+ New Space" card
- **Recents section** — horizontal scroll of recently accessed content with thumbnails
- **Sidebar**: Add content, Search, History, Recents list, Spaces list (expandable to show content inside), My Library, Help & Tools section, User profile + plan badge at bottom

### 2. Content Upload Flow
- **File picker dialog** — standard OS file picker for PDFs, docs, etc.
- **Link modal** — paste YouTube/website URL, click "Add"
- **Paste Text modal** — textarea to paste notes, click "Add"
- **Record Lecture modal** — two options: Microphone (record voice/class) or Browser Tab (capture audio playing in browser)
- **Upload limit paywall** — free plan has upload limits, hitting it triggers upgrade modal with Pro/Max tiers, annual/monthly toggle, 7-day free trial CTA

### 3. Space View (Inside a Space)
- **Space header**: Name (editable), add icon, add cover, description
- **"+ Add Content" button** with dropdown: New Folder, Add Syllabus, Add Exam Date
- **"New Exam" button** — create exam from space content
- **Content list**: table view (Name, Added On) or card view toggle (grid/list/compact icons)
- **Right panel — "Learn Tab"**: Always visible alongside the space
  - **Generate widgets**: Podcast, Video, Summary, Quiz, Flashcards, Notes, Chapters, Lesson Plan
  - **"My Sets" section**: Previously generated content (summaries, flashcard sets, etc.)
  - **"Ask anything" chat input** at bottom with Voice mode button
- **Empty space state**: "Add content to this space" with upload/paste/search prompt
- **Content in "added on" order**: shows as expanded preview cards (not just filenames)

### 4. Content Viewer (Document Open)
- **Split panel**: Document on left, Learn Tab on right
- **Document viewer**: PDF/text with page navigation, annotations count, page fit options, "Listen" button (TTS)
- **Right panel tabs**: Can add multiple tabs (e.g., "Untitled note" + "Learn Tab")
- **Notes tab**: Markdown editor, "Start typing... use / for commands"
- **Text selection toolbar**: Explain, Chat, Quiz, Flashcards, Add to note, Highlight, Listen
- **Generate buttons** create content in "My Sets" section below

### 5. AI Features (from Quick Guide)

#### Add Content
- Upload, paste, or record
- Website links (paste URL, scrapes Wikipedia etc.)
- Record Lectures & Meetings (mic or browser tab capture for Google Meet etc.)
- Ask questions with images (upload photo of homework/whiteboard)

#### Chat
- Chat with AI about your content
- **Mention Tools in Chat** — type @ to add tools like quizzes and diagrams inline
- **Visualize Chemical Structures** — generate molecular diagrams
- Ask about any content (mention @content to reference other files)
- **Create Interactive Visualizations** — 3D brain models, historical timelines, explorable concepts. Chat includes tools: Black Holes Explained, Search, Study Mode, Study Notes, etc.

#### Summary, Chapters, Transcripts
- Generate summaries (brief or detailed, chapter breakdowns, transcripts for video)
- **Summary prompts** — custom prompts for summaries with different formats
- View as: Chat, Transcripts, Flashcards, Quizzes, Summary tabs on the content

#### Flashcards
- **Practice flashcards** — AI tutor that simplifies ideas and guides to right sources. "Say Teach Me! for AI tutor to go over everything"
- **Active Recall Flashcards** — master key concepts by actively recalling answers

#### Quizzes
- **Choose your quiz style** — Multiple choice, Free response, Fill in the blank, True or false. Set difficulty: easy to hard.
- **Study with quizzes** — break down into concepts, chat for questions/feedback/sources

#### Podcast
- **Generate Podcasts** — convert content to audio with speaker voices, key concepts. Listen while browsing.

#### Voice Mode
- **Learn with voice mode** — AI tutor you can talk to. "Say Teach Me! for AI tutor to go over everything"

#### Exams
- **Test your knowledge on everything** — create space with all content, build custom exams, get answer breakdowns, track progress, review weak spots

#### Spaces & Space Chat
- **Spaces & space chat** — add contents to spaces, chat with all your contents
- **More Accurate Space Chat** — cites timestamps, page numbers, sections from your content

#### Sharing
- **Share your space** — make spaces public/private, share link with friends/classmates

#### Settings
- **Languages, AI Models, & More** — 20+ languages, 4+ AI models (YouLearn AI, GPT-4o, etc.), manage preferences

---

## YouLearn User Journeys

### Journey 1: Upload & Learn (Core Flow)
1. Land on dashboard → Click "Upload" → Pick file → File appears in recents
2. Click file → Opens in split view (doc left, Learn Tab right)
3. Generate summary/quiz/flashcards from right panel
4. Highlight text → Use floating toolbar for explain/quiz/flashcard
5. Chat with AI about content in "Ask anything" input

### Journey 2: Space-Based Learning
1. Create new space (e.g., "Organic Chemistry")
2. Add multiple content items (PDFs, YouTube links, pasted notes)
3. Content listed in the space, Learn Tab on right generates across all content
4. Create exam from the space's content
5. Space Chat — ask questions that reference all materials in the space

### Journey 3: YouTube/Web Learning
1. Click "Link" → Paste YouTube URL or website
2. YouLearn transcribes video, shows chapters + transcript on left
3. Right panel: generate summary, quiz, podcast from the video
4. Chat about specific moments in the video

### Journey 4: Quick Topic Learning
1. Type topic in "Learn anything" search bar
2. YouLearn finds/generates content about the topic
3. Browse and interact without uploading anything

---

## What YouLearn Does Well
- **Frictionless content input** — 4 methods (upload, link, paste, record) + "learn anything" search
- **Rich media support** — PDFs, YouTube, websites, audio recordings, images
- **Always-visible Learn Tab** — right panel is persistent, not hidden behind clicks
- **Space-level features** — exam generation, space chat across all content
- **Podcast generation** — unique differentiator, listen while doing other things
- **Voice mode** — talk to the AI tutor
- **Text selection toolbar** — contextual actions on highlighted text
- **Quick Guide** — comprehensive in-app tutorial with live demos

## What YouLearn Does Poorly (Our Opportunity)
1. **No concept ordering** — treats every document independently. No "learn this before that."
2. **No prerequisite mapping** — doesn't identify what you need to understand first
3. **No guided progression** — you choose what to generate (summary, quiz, etc.) but there's no structured learning path through the material
4. **No comprehension gating** — never checks if you actually understood before moving on
5. **Passive by default** — the default experience is "here's your content + some AI widgets." You have to actively choose to quiz yourself.
6. **No progress tracking** — no sense of "you've mastered 60% of this material"
7. **No cross-document concept linking** — doesn't connect concepts across different uploads
8. **Exam feature is separate** — not integrated into the learning flow

---

## StudyZone Differentiation Strategy

### What We Keep (Table Stakes)
These are expected features — users will compare us to YouLearn:
- [ ] File upload (PDF, DOCX, PPTX, TXT)
- [ ] Paste text
- [ ] Link/URL input
- [ ] Split panel (document left, AI right)
- [ ] AI Chat about content
- [ ] Summary generation
- [ ] Quiz generation (multiple choice + free response)
- [ ] Flashcard generation
- [ ] Notes generation
- [ ] Text selection toolbar (explain, quiz, flashcard, note)
- [ ] Spaces/Learning Paths to organize content
- [ ] "Ask anything" input

### What We Add (Our Differentiators)

#### 1. First-Principles Lesson Plans (PRIMARY DIFFERENTIATOR)
When you upload content, StudyZone doesn't just show it — it:
- Extracts all concepts and their dependencies
- Orders them from foundational → advanced
- Creates a step-by-step lesson plan
- **"Start Guided Learning"** button on every learning path

YouLearn equivalent: Their "Lesson Plan" widget generates a static list. Ours is interactive and drives the learning experience.

#### 2. Guided Learning Mode
A dedicated mode where the AI teaches you step by step:
- Shows one concept at a time
- Explains it using your uploaded materials as context
- Asks a comprehension question
- Only advances when you demonstrate understanding
- Progress bar shows how far through the material you are

YouLearn equivalent: Nothing. They have no guided mode.

#### 3. Comprehension Gating
- Before moving to the next concept, you must answer a check question
- If you struggle, the AI re-explains from a different angle
- Prevents the "I read it so I know it" illusion

YouLearn equivalent: Quizzes exist but are optional and disconnected from the reading flow.

#### 4. Cross-Document Concept Mapping
- Upload 5 PDFs to a learning path
- StudyZone maps concepts ACROSS all documents
- Shows which concepts appear in multiple sources
- Builds one unified learning path from all materials

YouLearn equivalent: Space Chat can reference multiple docs, but doesn't map or connect concepts.

#### 5. Progress Tracking & Mastery
- Visual progress on each learning path (% complete, concepts mastered)
- Quiz scores feed back into mastery tracking
- Weak spots highlighted — "you haven't mastered Bellman equations yet"
- Dashboard shows overall progress across all paths

YouLearn equivalent: No progress tracking at all.

#### 6. "Teach Me This" (Selected Text → First-Principles Explanation)
- Highlight any text → "Teach me this"
- AI identifies prerequisites for that concept
- Explains from the ground up, not just a definition
- Different from YouLearn's "Explain" which gives a surface-level explanation

### What We Skip for V1 (Add Later)
- [ ] YouTube video support (V2)
- [ ] Audio recording / lecture capture (V2)
- [ ] Podcast generation (V2)
- [ ] Voice mode (V2)
- [ ] Image upload / homework photo (V2)
- [ ] Chemical structure visualization (V2)
- [ ] Interactive 3D visualizations (V2)
- [ ] Canvas/D2L import (V2)
- [ ] Space sharing / public links (V2)
- [ ] Multiple AI model selection (V2)
- [ ] Video generation (V2)

---

## V1 Feature Priority (Ordered)

| Priority | Feature | Why |
|----------|---------|-----|
| P0 | File upload + text extraction | Core input method |
| P0 | Learning Paths (CRUD) | Core organization |
| P0 | Document viewer (split panel) | Core viewing experience |
| P0 | AI Chat about content | Table stakes |
| P0 | Lesson Plan generation | Key differentiator |
| P0 | Guided Learning Mode | Key differentiator |
| P1 | Summary generation | Table stakes |
| P1 | Quiz generation | Feeds into comprehension gating |
| P1 | Flashcard generation | Expected feature |
| P1 | Text selection toolbar | Expected feature |
| P1 | Progress tracking | Differentiator |
| P1 | Comprehension gating | Differentiator |
| P2 | Paste text input | Easy to add |
| P2 | Link/URL input | Needs web scraping |
| P2 | Cross-document concept mapping | Complex but powerful |
| P2 | Notes generation | Nice to have |
| P2 | "Teach me this" deep explain | Differentiator but needs good prompting |
