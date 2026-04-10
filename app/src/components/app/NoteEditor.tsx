"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Undo,
  Redo,
  Trash2,
} from "lucide-react";

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  onSave: (noteId: string, title: string, content: string) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  onSave,
  onDelete,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noteIdRef = useRef(noteId);

  // Update ref when noteId changes
  useEffect(() => {
    noteIdRef.current = noteId;
  }, [noteId]);

  // Reset state when noteId changes
  useEffect(() => {
    setTitle(initialTitle);
  }, [noteId, initialTitle]);

  const debouncedSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onSave(noteIdRef.current, newTitle, newContent);
      }, 1000);
    },
    [onSave]
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [StarterKit],
      content: initialContent,
      editorProps: {
        attributes: {
          class: "prose-note outline-none min-h-[200px] px-5 py-4 font-app text-[14px] leading-[1.7] text-ink/90",
        },
      },
      onUpdate: ({ editor: e }) => {
        debouncedSave(title, e.getHTML());
      },
    },
    [noteId] // Recreate editor when noteId changes
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (editor) debouncedSave(val || "Untitled Note", editor.getHTML());
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this note?");
    if (confirmed) onDelete(noteId);
  };

  if (!editor) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Note"
          className="flex-1 bg-transparent font-app-heading text-[18px] font-semibold outline-none placeholder:text-ink-muted/40"
        />
        <button
          onClick={handleDelete}
          className="rounded-lg p-1.5 text-ink-muted/50 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Delete note"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-black/[0.04] px-4 pb-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo size={14} />
        </ToolbarButton>

        <div className="mx-1.5 h-4 w-px bg-black/[0.06]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>

        <div className="mx-1.5 h-4 w-px bg-black/[0.06]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered size={14} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-black/[0.06] text-ink"
          : "text-ink-muted hover:bg-black/[0.04] hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
