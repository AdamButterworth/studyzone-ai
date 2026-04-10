"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  StickyNote,
  Copy,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";

interface NoteOption {
  id: string;
  title: string;
}

interface SelectionToolbarProps {
  text: string;
  rect: { top: number; left: number; bottom: number; width: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  notes: NoteOption[];
  onAsk: (text: string) => void;
  onAddToNote: (noteId: string, text: string) => void;
  onCreateNoteWithText: (text: string) => void;
  onDismiss: () => void;
}

export default function SelectionToolbar({
  text,
  rect,
  containerRef,
  notes,
  onAsk,
  onAddToNote,
  onCreateNoteWithText,
  onDismiss,
}: SelectionToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [notePickerOpen, setNotePickerOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const notePickerRef = useRef<HTMLDivElement>(null);

  // Position fixed relative to viewport
  const top = rect.bottom + 8;
  const left = Math.max(8, rect.left + rect.width / 2 - 150);

  // Close note picker on outside click
  useEffect(() => {
    if (!notePickerOpen) return;
    const close = (e: MouseEvent) => {
      if (notePickerRef.current && !notePickerRef.current.contains(e.target as Node)) {
        setNotePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [notePickerOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onDismiss();
    }, 1200);
  };

  const handleAsk = () => {
    onAsk(text);
    onDismiss();
  };

  const handleAddToNote = (noteId: string) => {
    onAddToNote(noteId, text);
    setNotePickerOpen(false);
    onDismiss();
  };

  const handleNewNote = () => {
    onCreateNoteWithText(text);
    setNotePickerOpen(false);
    onDismiss();
  };

  const recentNote = notes.length > 0 ? notes[0] : null;
  const truncatedName = recentNote
    ? recentNote.title.length > 16
      ? recentNote.title.slice(0, 16) + "…"
      : recentNote.title
    : null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50"
      style={{ top, left }}
    >
      <div className="flex items-center gap-0.5 rounded-xl border border-black/10 bg-white px-1.5 py-1 shadow-xl">
        {/* Ask about this */}
        <button
          onClick={handleAsk}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-app text-[12px] font-medium text-ink/80 transition-colors hover:bg-black/[0.04] hover:text-ink"
        >
          <MessageSquare size={13} />
          Ask
        </button>

        <div className="h-4 w-px bg-black/[0.08]" />

        {/* Add to note */}
        <div className="relative" ref={notePickerRef}>
          <div className="flex items-center">
            <button
              onClick={() => {
                if (recentNote) {
                  handleAddToNote(recentNote.id);
                } else {
                  handleNewNote();
                }
              }}
              className="flex items-center gap-1.5 rounded-l-lg px-2.5 py-1.5 font-app text-[12px] font-medium text-ink/80 transition-colors hover:bg-black/[0.04] hover:text-ink"
            >
              <StickyNote size={13} />
              {recentNote ? `Add to "${truncatedName}"` : "New Note"}
            </button>
            {notes.length > 0 && (
              <button
                onClick={() => setNotePickerOpen(!notePickerOpen)}
                className="rounded-r-lg px-1 py-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
              >
                <ChevronDown size={11} />
              </button>
            )}
          </div>

          {/* Note picker dropdown */}
          {notePickerOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-black/8 bg-white py-1 shadow-lg">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleAddToNote(note.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left font-app text-[12px] text-ink/80 transition-colors hover:bg-black/[0.04]"
                >
                  <StickyNote size={12} className="shrink-0 text-ink-muted" />
                  <span className="truncate">{note.title}</span>
                  {note.id === recentNote?.id && (
                    <Check size={12} className="ml-auto shrink-0 text-ink-muted" />
                  )}
                </button>
              ))}
              <div className="mx-2 my-1 h-px bg-black/[0.06]" />
              <button
                onClick={handleNewNote}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-app text-[12px] text-ink/80 transition-colors hover:bg-black/[0.04]"
              >
                <Plus size={12} className="shrink-0 text-ink-muted" />
                New Note
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-black/[0.08]" />

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-app text-[12px] font-medium text-ink/80 transition-colors hover:bg-black/[0.04] hover:text-ink"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
