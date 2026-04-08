# StudyZone AI — App Structure (Craft Design + YouLearn IA)

**Design**: Craft (clean, minimal, serif headings, rounded cards, whitespace, cream tones)
**Structure**: YouLearn (subjects, content upload, AI tools panel)
**Terminology**: "Subjects" (not Spaces, not Learning Paths)

---

## Sidebar (Craft-style)

Like Craft's folder sidebar — clean, expandable, emoji icons.

```
┌─────────────────────────┐
│ [Logo] StudyZone AI  «  │
│                         │
│ + New Subject           │
│ 🔍 Search               │
│                         │
│ SUBJECTS         + ▾    │  ← collapsible, like Craft's "Folders"
│ 🧠 Reinforcement L…  3  │  ← click to expand
│    ├ lecture-notes.pdf   │
│    ├ policy-gradients…   │
│    └ bellman-eqs.txt     │
│ 🧪 Organic Chemistry  5  │
│ ⚖️ Constitutional Law  2 │
│                         │
│ RECENTS                 │
│  ○ Policy Gradients     │
│  ○ Bellman Equations    │
│                         │
│ ─────────────────────── │
│ Help & Feedback         │
│ Settings                │
│                         │
│ 🟣 Adam B.              │
│ Free Plan               │
└─────────────────────────┘
```

Key Craft patterns to replicate:
- Expandable subjects show content items indented below (like Craft's folders → docs)
- "+" button next to SUBJECTS header to create new
- Collapse chevron (▾) on section headers
- Content count on the right of each subject
- Active item highlighted with light purple/lavender tint
- Clean, thin borders, lots of whitespace

---

## Dashboard / Home (`/app`)

Craft's clean layout + YouLearn's "Ready to learn?" pattern.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Ready to learn, Adam?                  │  ← serif heading, centered
│                                                     │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│     │ 📤       │  │ 🔗       │  │ 📋       │      │
│     │ Upload   │  │ Link     │  │ Paste    │      │  ← Craft-style rounded cards
│     │ Files    │  │ URL      │  │ Text     │      │
│     └──────────┘  └──────────┘  └──────────┘      │
│                                                     │
│     [ Learn anything...                    🔍 ]     │  ← search/topic bar
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Subjects                    ⊞ Grid  ≡ List        │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  + New   │  │ 🧠       │  │ 🧪       │         │
│  │ Subject  │  │ Reinfor… │  │ Organic… │         │  ← Craft-style rich cards
│  │          │  │ 3 items  │  │ 5 items  │         │
│  │ (dashed) │  │ Updated… │  │ Updated… │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  Recents                              View all →   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ doc1   │ │ doc2   │ │ doc3   │ │ doc4   │     │  ← horizontal scroll
│  └────────┘ └────────┘ └────────┘ └────────┘     │
└─────────────────────────────────────────────────────┘
```

Design notes:
- "Ready to learn?" in serif (Playfair), centered — like YouLearn but with Craft typography
- Upload cards: Craft-style rounded-xl with subtle border, icon + label + subtitle
- Subject cards in grid: Craft's rich card style (preview content, emoji icon, name, item count, last updated)
- Dashed "+" card for new subject (like YouLearn's "New Space")
- Recents as horizontal scroll of content thumbnails (like YouLearn)
- Grid/List toggle icons (like Craft's view switcher)

---

## Inside a Subject (`/app/subject/[id]`)

Blends Craft's folder view with YouLearn's space page.

```
┌───────────────────────────────────┬────────────────────┐
│                                   │  Study Tools       │
│  🧠 Reinforcement Learning        │                    │
│  No description — click to add    │  ┌──────┐┌──────┐ │
│                                   │  │Summ. ││Quiz  │ │
│  ⊕ Add Content  ⋯  ⊞ ≡          │  └──────┘└──────┘ │
│                                   │  ┌──────┐┌──────┐ │
│  ┌────────────────────────────┐   │  │Flash ││Notes │ │
│  │ 📄 lecture-notes-mdp.pdf   │   │  └──────┘└──────┘ │
│  │    Added 2 days ago        │   │  ┌──────────────┐ │
│  ├────────────────────────────┤   │  │ Lesson Plan  │ │
│  │ 📄 policy-gradients.pptx   │   │  │ ★ New        │ │
│  │    Added 1 day ago         │   │  └──────────────┘ │
│  ├────────────────────────────┤   │                    │
│  │ 📄 bellman-equations.txt   │   │  My Sets           │
│  │    Added 3 hours ago       │   │  ○ Detailed Summ…  │
│  └────────────────────────────┘   │  ○ Untitled note   │
│                                   │                    │
│  ┌─────────────────────────────┐  │  ┌──────────────┐ │
│  │ 🎯 Start Guided Learning   │  │  │ Ask anything  │ │
│  │    Learn from first         │  │  └──────────────┘ │
│  │    principles               │  │                    │
│  └─────────────────────────────┘  │                    │
└───────────────────────────────────┴────────────────────┘
```

Left side (Craft-styled):
- Subject name (large, serif) + emoji icon
- Description (click to add/edit — like Craft's inline editing)
- "Add Content" button (dropdown: Upload, Link, Paste) — like Craft's "+" dropdown (New Doc, New Folder, From Template)
- View toggle (grid/list) + three-dot menu
- Content list: clean rows (Craft's list view) or rich cards (Craft's grid view) with thumbnails
- **"Start Guided Learning" CTA** — our differentiator, prominent card at bottom

Right side (YouLearn-inspired, Craft-styled):
- Study Tools panel (collapsible)
- Generate buttons: Summary, Quiz, Flashcards, Notes, Lesson Plan — styled as Craft-like rounded cards with colored icons
- "My Sets" section: previously generated content
- "Ask anything" chat input at bottom
- This panel can be collapsed to give full width to content

---

## Key Design Decisions

### Cards
- Craft style: `rounded-xl`, subtle `border border-black/5`, white bg, soft shadow
- Subject cards: emoji icon, name, item count, last updated, optional preview
- Content items in list: clean rows with file icon, name, date. In grid: thumbnail cards

### Typography in App
- **Headings** (subject names, "Ready to learn?"): Playfair Display (serif) — keeps the Craft editorial feel
- **Body/UI** (buttons, labels, content): DM Sans (sans-serif) — clean and readable
- This matches Craft's serif headings + sans-serif body pattern

### Colors
- Background: `#FAF7F4` (very light warm cream — less intense than landing page)
- Sidebar: white with thin right border
- Cards: white
- Active/selected: light lavender tint
- Study tools panel: same cream background, no harsh contrast

### "Add Content" Dropdown (Craft-style)
Like Craft's "+" dropdown but for learning:
```
┌─────────────────────────┐
│ 📤 Upload Files         │
│   PDF, DOCX, PPTX, TXT │
│ ─────────────────────── │
│ 🔗 Add Link             │
│   YouTube, Website      │
│ ─────────────────────── │
│ 📋 Paste Text           │
│   Copy and paste notes  │
└─────────────────────────┘
```

---

## What Makes Us Different (Visible in UI)

1. **"Start Guided Learning" button** on every subject — prominent, not hidden
2. **Lesson Plan as a first-class tool** (not just another widget) — shows concept order with progress
3. **Progress indicators** on subject cards (% mastered) and in the guided mode
4. **Comprehension checks** woven into the guided flow
5. **Cross-document concept view** — shows which concepts appear across multiple uploads

---

## Implementation Order

1. ✅ Sidebar shell (done — needs Subject terminology update)
2. ✅ Top bar with search (done)
3. **Next**: Dashboard with "Ready to learn?", upload cards, subjects grid, recents
4. **Then**: Subject page with content list + study tools panel
5. **Then**: Document viewer (split panel)
6. **Then**: AI features (chat, summary, quiz, flashcards, lesson plan)
7. **Then**: Guided learning mode
