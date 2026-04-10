"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Trash2,
  ChevronDown,
  Link2,
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
      extensions: [
        StarterKit,
        TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-sky underline cursor-pointer" } }),
      ],
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

  // Scroll to bottom when editor mounts (e.g. after content appended externally)
  const editorScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editor && initialContent && editorScrollRef.current) {
      setTimeout(() => {
        editorScrollRef.current?.scrollTo({ top: editorScrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

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
          onClick={() => onDelete(noteId)}
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

        <HeadingDropdown editor={editor} />

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
        <LinkButton editor={editor} />

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
      <div ref={editorScrollRef} className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function LinkButton({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("https://");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (open) {
      setUrl("https://");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!editor) return null;

  const handleSubmit = () => {
    if (!url || url === "https://") {
      setOpen(false);
      return;
    }
    const href = url.match(/^https?:\/\//) ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <ToolbarButton
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
          } else {
            setOpen(!open);
          }
        }}
        active={editor.isActive("link")}
        title="Link"
      >
        <Link2 size={14} />
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-60 rounded-xl border border-black/8 bg-white p-2.5 shadow-lg">
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="https://example.com"
              className="flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 font-app text-[12px] outline-none focus:border-black/20"
            />
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-ink px-2.5 py-1.5 font-app text-[11px] font-medium text-white transition-colors hover:bg-ink/80"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HeadingDropdown({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!editor) return null;

  const current = editor.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor.isActive("heading", { level: 2 })
      ? "Heading 2"
      : editor.isActive("heading", { level: 3 })
        ? "Heading 3"
        : "Normal";

  const options = [
    { label: "Normal", action: () => editor.chain().focus().setParagraph().run() },
    { label: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
      >
        {current}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-36 rounded-xl border border-black/8 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); setOpen(false); }}
              className={`flex w-full items-center px-3 py-1.5 text-left transition-colors hover:bg-black/[0.04] ${
                current === opt.label ? "font-medium text-ink" : "text-ink-muted"
              } ${
                opt.label === "Heading 1" ? "text-[17px] font-semibold" :
                opt.label === "Heading 2" ? "text-[15px] font-semibold" :
                opt.label === "Heading 3" ? "text-[14px] font-semibold" :
                "text-[13px]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
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
