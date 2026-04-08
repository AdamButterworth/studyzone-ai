# StudyZone AI — App Layout Plan

## Overall Structure

```
┌──────────┬──────────────────────────────────────┐
│          │  Top Bar (search + actions)           │
│  Left    ├──────────────────────────────────────┤
│  Sidebar │                                      │
│          │  Main Content Area                   │
│  (collap-│  (changes based on view)             │
│   sible) │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

---

## Left Sidebar

Collapsible — slides left when closed, toggle button to open/close.

### Sections (top to bottom):

1. **Header**: Logo + "StudyZone AI" + collapse toggle (« icon)
2. **Quick Actions**: "+ New Learning Path" button
3. **Search**: Quick search across all paths and content
4. **Recents**: Last 3-5 opened documents (quick access)
5. **Learning Paths**: List of all paths, each expandable to show content items inside
6. **Divider**
7. **Bottom section**:
   - Help & Feedback link
   - Settings link
   - User profile card (avatar, name, plan badge)

### Collapsed state:
- Only shows icons (logo icon, +, search, path icons, user avatar)
- Hovering could expand temporarily (future enhancement)

---

## Top Bar

- **Left**: Breadcrumb (Home > Path Name > Document Name)
- **Center**: Search bar ("Search or learn anything...")
- **Right**: Notifications bell (future), user avatar dropdown

---

## Main Content — Views

### View 1: Home / Dashboard
**Route**: `/app`
**When**: No learning path selected

- **Welcome header**: "Ready to learn, [Name]?"
- **Quick action cards** (row of 3):
  - Upload (file, drag & drop)
  - Link (URL)
  - Paste (text)
- **"Learn anything" input**: Type a topic to start learning even without uploads
- **Learning Paths section**:
  - Grid/list toggle
  - "+ New Path" card
  - Existing path cards (icon, name, doc count, last opened)
  - Sort: newest, last opened, alphabetical
- **Recents section**:
  - Recently opened documents across all paths
  - Horizontal scroll of content cards
  - "View all" link

### View 2: Inside a Learning Path
**Route**: `/app/path/[id]`
**When**: A learning path is selected from sidebar or dashboard

- **Path header**:
  - Path name (editable inline)
  - Icon (clickable to change)
  - Description (editable)
  - "+ Add Content" button
- **Upload area**: Same 3 quick action cards (Upload, Link, Paste)
- **Content list**:
  - Grid/list toggle
  - Each item: thumbnail, name, type badge, date added, 3-dot menu
  - Sort: newest, name, type
  - Empty state: "Upload your first document to get started"
- **"Start Guided Learning" button**: Prominent CTA that launches the lesson plan / guided mode for all content in this path — THIS IS OUR KEY DIFFERENTIATOR

### View 3: Content Viewer
**Route**: `/app/path/[id]/content/[contentId]`
**When**: A document is opened

- **Split panel layout**:
  - **Left**: Document viewer (PDF renderer, text/markdown viewer)
  - **Right**: AI Learning Panel
- **Left panel**:
  - Document content
  - Text selection → floating toolbar (Explain, Chat, Quiz, Flashcards, Note, Highlight)
  - Page navigation for PDFs
- **Right panel** (tabbed):
  - **Chat tab**: AI conversation about the content
  - **Generate tab**: Buttons for Summary, Quiz, Flashcards, Notes, Lesson Plan
  - **Lesson Plan tab**: Step-by-step guided learning view with progress
- **Panel is resizable** (drag divider)
- **Right panel can collapse** to focus on reading

### View 4: Guided Learning Mode
**Route**: `/app/path/[id]/learn`
**When**: User clicks "Start Guided Learning"

- **Full-width guided experience** (no split panel)
- **Step-by-step flow**:
  1. AI shows current concept
  2. Explains with context from uploaded materials
  3. Asks comprehension check question
  4. User answers → AI confirms or corrects
  5. Advance to next concept
- **Progress bar** at top
- **Sidebar shows lesson plan** with completed/current/upcoming steps
- **"Teach me this"** button at any point for deeper explanation
- **Can exit back to content viewer** at any time

---

## Data Model Recap

```
User
├── Learning Paths
│   ├── Path metadata (name, icon, description)
│   ├── Content Items
│   │   ├── File metadata (name, type, size, upload date)
│   │   ├── Raw text (extracted from file)
│   │   └── Generated content (summary, quiz, flashcards, notes, lesson plan)
│   ├── Chat messages
│   ├── Highlights & notes
│   └── Learning progress (current step, completed steps, quiz scores)
```

---

## Implementation Order

1. **App shell**: Sidebar + top bar + main area skeleton ← CURRENT STEP
2. **Home dashboard**: Welcome, quick actions, path cards
3. **Create/manage learning paths**: CRUD operations
4. **Content upload & parsing**: File upload, text extraction
5. **Inside a learning path**: Content list, management
6. **Content viewer**: Split panel, document rendering
7. **AI features**: Chat, summary, quiz, flashcards, notes
8. **Guided learning mode**: Lesson plans, step-by-step, progress

---

## Design Notes

- Sidebar background: white or very light cream, thin right border
- Main area background: cream (same as landing page)
- Cards: white with subtle border, rounded-xl
- Active sidebar item: light lavender/purple tint
- Transitions: sidebar slides with 200-300ms ease-out
- Mobile: sidebar becomes overlay/drawer
