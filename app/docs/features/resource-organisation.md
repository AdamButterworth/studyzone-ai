# Resource Organisation TODO

## Problem
As users create more resources (notes, chats, summaries) per document, the My Resources list becomes long and unmanageable. Also, there's no way to see all notes/resources across all documents in a subject.

## Two levels of organisation needed

### 1. Per-Document: Folders/Categories in My Resources

**Problem:** My Resources for a single document can have 10+ items (multiple chats, notes, summaries). No way to group or filter.

**Options:**
- **Folders** — user-created folders within My Resources (e.g., "Exam Prep", "Key Concepts")
- **Auto-categories** — group by type (Chats, Notes, Summaries) with collapsible sections
- **Filter chips** — "All | Chats | Notes | Summaries" filter at the top

**Recommendation for v1:** Filter chips (simplest). Auto-categories for v2. Folders for v3.

**Filter chips approach:**
- Row of chips at top of My Resources: All | Chats | Notes | Summaries
- Click to filter the list
- Show count badge on each chip
- No DB changes needed — just client-side filtering

### 2. Subject-Level: Cross-Document Resource View

**Problem:** If you have 5 PDFs in a subject, each with notes and chats, there's no unified view. You have to open each document individually.

**What's needed:** A subject-level "Resources" tab or page that aggregates:
- All notes across all documents in the subject
- All chat threads across all documents
- All summaries
- Grouped by document or by type

**Approach:**
- New section on the subject page (below the document list)
- Or a "Resources" tab alongside the document list view
- Query: `SELECT * FROM notes WHERE document_id IN (SELECT id FROM documents WHERE subject_id = ?)` 
- Same for chats, summaries
- Each item shows which document it belongs to

**UI ideas:**
- Collapsible sections per document: "Policy Gradients.pdf → 2 notes, 1 chat, 1 summary"
- Or flat list with document name as a subtitle
- Filter by type
- Search across all resources

### 3. Subject-Level Notes

**New concept:** Notes that belong to a subject, not a specific document.
- "Cross-document notes" for synthesizing across papers
- Could be where the subject-level lesson plan lives
- New `subject_notes` or add optional `subject_id` to existing `notes` table

## Implementation priority

1. **Filter chips on My Resources** — quick win, no DB changes
2. **Subject-level resource aggregation** — medium effort, new queries + UI section
3. **Subject-level notes** — schema change + new UI
4. **Folders** — significant effort, new table, drag-and-drop

## Files affected
- `src/app/(dashboard)/subject/[id]/doc/[docId]/page.tsx` — filter chips on My Resources
- `src/app/(dashboard)/subject/[id]/page.tsx` — subject-level resources section
- Possibly new migration for subject_notes
