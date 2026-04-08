"use client";

import { useState, useRef, useEffect } from "react";
import { Search, PanelLeft, FolderOpen, BookOpen } from "lucide-react";
import { useTopBar } from "@/lib/TopBarContext";

interface AppTopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function AppTopBar({ sidebarOpen, onToggleSidebar }: AppTopBarProps) {
  const { breadcrumb } = useTopBar();
  const [searching, setSearching] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleBarClick = () => {
    if (breadcrumb && !searching && !editingTitle) {
      setSearching(true);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  };

  const startEditTitle = () => {
    if (!breadcrumb) return;
    setTitleDraft(breadcrumb.docTitle);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const commitTitle = () => {
    if (breadcrumb && titleDraft.trim()) {
      breadcrumb.onTitleChange(titleDraft.trim());
    }
    setEditingTitle(false);
  };

  // Reset editing state when navigating away from doc page
  useEffect(() => {
    if (!breadcrumb) {
      setEditingTitle(false);
      setSearching(false);
    }
  }, [breadcrumb]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4">
      {/* Sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
        >
          <PanelLeft size={18} />
        </button>
      )}

      {/* Mobile toggle (always visible on mobile) */}
      {sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-black/5 hover:text-ink md:hidden"
        >
          <PanelLeft size={18} />
        </button>
      )}

      {/* Search bar / Breadcrumb */}
      <div className="flex flex-1 justify-center">
        {breadcrumb && !searching ? (
          /* ── Breadcrumb mode ── */
          <div
            onClick={handleBarClick}
            className="flex w-full max-w-xl cursor-text items-center rounded-xl border border-black/5 bg-white/60 px-4 py-2 transition-colors hover:border-black/10 hover:bg-white"
          >
            <Search size={15} className="shrink-0 text-ink-muted/40" />
            <div className="ml-3 flex min-w-0 flex-1 items-center gap-1.5 font-app text-[14px]">
              <a
                href={`/subject/${breadcrumb.subjectId}`}
                onClick={(e) => e.stopPropagation()}
                className="group/crumb flex shrink-0 items-center gap-1.5 text-ink/70 transition-colors hover:text-ink"
              >
                <FolderOpen size={14} className="text-ink-muted/60 group-hover/crumb:text-ink/70" />
                <span className="truncate max-w-[200px] group-hover/crumb:font-semibold">{breadcrumb.subjectName}</span>
              </a>
              <span className="shrink-0 text-ink-muted/30 mx-0.5">/</span>
              {editingTitle ? (
                <div onClick={(e) => e.stopPropagation()} className="flex min-w-0 flex-1 items-center gap-1.5">
                  <BookOpen size={14} className="shrink-0 text-ink/70" />
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitTitle();
                      if (e.key === "Escape") setEditingTitle(false);
                    }}
                    className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-2 py-0.5 text-[14px] font-medium text-ink outline-none focus:border-black/20"
                  />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditTitle();
                  }}
                  className="group/crumb flex min-w-0 items-center gap-1.5 truncate rounded-md px-1.5 py-0.5 -mx-1.5 text-ink/70 transition-all hover:text-ink hover:bg-black/[0.04] hover:ring-1 hover:ring-black/8"
                >
                  <BookOpen size={14} className="shrink-0 text-ink-muted/60 group-hover/crumb:text-ink/70" />
                  <span className="truncate group-hover/crumb:font-semibold">{breadcrumb.docTitle}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Search mode ── */
          <label className="flex w-full max-w-xl cursor-text items-center gap-2 rounded-xl border border-black/5 bg-white/60 px-4 py-2 transition-colors focus-within:border-black/10 focus-within:bg-white">
            <Search size={15} className="shrink-0 text-ink-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or learn anything..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
              onBlur={() => {
                if (breadcrumb) setSearching(false);
              }}
            />
          </label>
        )}
      </div>
    </header>
  );
}
