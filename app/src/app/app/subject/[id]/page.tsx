"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Upload,
  Link2,
  ClipboardPaste,
  Mic,
  ArrowRight,
  List,
  LayoutGrid,
  MoreHorizontal,
  Sparkles,
  FileText,
  X,
  Check,
  Globe,
  ChevronDown,
  CloudUpload,
} from "lucide-react";

/* ─── Mock data ─── */

interface ContentItem {
  id: string;
  name: string;
  type: string;
  preview: string;
  added: string;
  lastViewed: string;
}

const MOCK_SUBJECTS: Record<
  string,
  { name: string; icon: string; description: string; content: ContentItem[] }
> = {
  rl: {
    name: "Reinforcement Learning",
    icon: "\u{1F9E0}",
    description: "CS 224R course materials",
    content: [
      {
        id: "1",
        name: "Policy Gradient Methods",
        type: "PDF",
        preview:
          "Key concepts of policy gradient algorithms including REINFORCE, advantage actor-critic...",
        added: "2 hours ago",
        lastViewed: "1 hour ago",
      },
      {
        id: "2",
        name: "Post-Training Methods",
        type: "PDF",
        preview:
          "RLHF, DPO, and other post-training alignment techniques for large language models...",
        added: "1 day ago",
        lastViewed: "3 hours ago",
      },
      {
        id: "3",
        name: "Bellman Equations",
        type: "TXT",
        preview:
          "Dynamic programming and the Bellman optimality equation for value functions...",
        added: "3 days ago",
        lastViewed: "1 day ago",
      },
      {
        id: "4",
        name: "Model-Based RL Survey",
        type: "PDF",
        preview:
          "A survey of model-based reinforcement learning approaches including Dyna, MBPO, and world models...",
        added: "5 days ago",
        lastViewed: "2 days ago",
      },
      {
        id: "5",
        name: "Q-Learning & DQN",
        type: "PDF",
        preview:
          "From tabular Q-learning to Deep Q-Networks, experience replay, and target networks...",
        added: "1 week ago",
        lastViewed: "4 days ago",
      },
    ],
  },
  new: {
    name: "Untitled Subject",
    icon: "\u{1F4DA}",
    description: "",
    content: [],
  },
};

/* ─── Component ─── */

export default function SubjectPage() {
  const params = useParams();
  const id = params.id as string;

  const subject = MOCK_SUBJECTS[id] || MOCK_SUBJECTS["new"];
  const [content, setContent] = useState<ContentItem[]>(subject.content);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pasteToast, setPasteToast] = useState<{
    text: string;
    isUrl: boolean;
  } | null>(null);
  const [learningQuery, setLearningQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const isEmpty = content.length === 0;

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Global paste-to-upload */
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const text = e.clipboardData?.getData("text/plain")?.trim();
      if (!text) return;

      const isUrl = /^https?:\/\//i.test(text);
      setPasteToast({ text, isUrl });
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  /* Auto-dismiss paste toast */
  useEffect(() => {
    if (!pasteToast) return;
    const timer = setTimeout(() => setPasteToast(null), 8000);
    return () => clearTimeout(timer);
  }, [pasteToast]);

  const handleAcceptPaste = useCallback(() => {
    if (!pasteToast) return;
    const newItem: ContentItem = {
      id: Date.now().toString(),
      name: pasteToast.isUrl
        ? pasteToast.text
        : pasteToast.text.slice(0, 60) +
          (pasteToast.text.length > 60 ? "..." : ""),
      type: pasteToast.isUrl ? "LINK" : "NOTE",
      preview: pasteToast.text.slice(0, 120),
      added: "Just now",
      lastViewed: "Just now",
    };
    setContent((prev) => [newItem, ...prev]);
    setPasteToast(null);
  }, [pasteToast]);

  return (
    <div className="relative flex min-h-full flex-col">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{subject.icon}</span>
            <h1 className="font-app-heading text-[22px] tracking-tight">
              {subject.name}
              {content.length > 0 && (
                <span className="ml-2 text-[15px] font-normal text-ink-muted">
                  ({content.length})
                </span>
              )}
            </h1>
          </div>
          {subject.description ? (
            <p className="mt-1 ml-[34px] font-app text-[13px] text-ink-muted">
              {subject.description}
            </p>
          ) : (
            <p className="mt-1 ml-[34px] font-app text-[13px] text-ink-muted/50 italic">
              Add a description...
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Add Content dropdown */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="font-app inline-flex items-center gap-1.5 rounded-xl border border-black/8 bg-white px-3.5 py-2 text-[13px] font-medium shadow-xs transition-all hover:shadow-md"
            >
              <Plus size={15} strokeWidth={2} />
              Add Content
              <ChevronDown
                size={12}
                className={`ml-0.5 text-ink-muted transition-transform ${addMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-black/8 bg-white p-1 shadow-xl">
                {[
                  {
                    icon: Upload,
                    label: "Upload",
                    desc: "PDF, DOCX, audio",
                    action: () => setUploadModalOpen(true),
                  },
                  { icon: Link2, label: "Link", desc: "YouTube, website", action: () => {} },
                  {
                    icon: ClipboardPaste,
                    label: "Paste",
                    desc: "Text or notes",
                    action: () => {},
                  },
                  { icon: Mic, label: "Record", desc: "Lecture audio", action: () => {} },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setAddMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-cream-dark/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-dark/40">
                      <item.icon size={15} className="text-ink-light" />
                    </div>
                    <div>
                      <p className="font-app text-[13px] font-medium">
                        {item.label}
                      </p>
                      <p className="font-app text-[11px] text-ink-muted">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          {!isEmpty && (
            <div className="flex items-center rounded-lg border border-black/8 bg-white p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-cream-dark/70 text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-cream-dark/70 text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          )}

          {/* More menu */}
          <button className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-white hover:text-ink">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="mt-6 flex-1 pb-20">
        {isEmpty ? (
          /* ─── Empty State ─── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-black/10">
              <Plus size={24} strokeWidth={1.5} className="text-ink-muted" />
            </div>
            <h2 className="font-app-heading mt-5 text-[17px]">
              Add content to this subject
            </h2>
            <p className="mt-2 max-w-sm font-app text-[13px] leading-relaxed text-ink-muted">
              Upload documents, paste notes, or add links to organize your study
              materials.
            </p>
            <p className="mt-1 font-app text-[12px] text-ink-muted/60">
              Tip: You can also just <kbd className="rounded bg-cream-dark px-1.5 py-0.5 font-mono text-[11px]">&#8984;V</kbd> paste anything on this page
            </p>

            <div className="mt-8 flex items-center gap-3">
              {[
                { icon: Upload, label: "Upload", action: () => setUploadModalOpen(true) },
                { icon: Link2, label: "Link", action: () => {} },
                { icon: ClipboardPaste, label: "Paste", action: () => {} },
                { icon: Mic, label: "Record", action: () => {} },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="font-app flex flex-col items-center gap-2.5 rounded-2xl border border-black/6 bg-white px-7 py-5 text-[12px] font-medium text-ink-light shadow-xs transition-all hover:border-black/12 hover:text-ink hover:shadow-md"
                >
                  <item.icon size={20} strokeWidth={1.5} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* ─── List View ─── */
          <div>
            {/* Column headers */}
            <div className="flex items-center gap-4 border-b border-black/5 px-3 pb-2.5 font-app text-[12px] text-ink-muted">
              <span className="flex-1">Name</span>
              <span className="w-12 text-center">Type</span>
              <span className="hidden w-24 text-right md:block">Added</span>
              <span className="hidden w-24 text-right md:block">Viewed</span>
              <span className="w-8" />
            </div>

            {/* Rows */}
            <div>
              {content.map((item) => (
                <a
                  key={item.id}
                  href={`/app/subject/${id}/doc/${item.id}`}
                  className="group flex items-center gap-4 border-b border-black/[0.03] px-3 py-3 transition-colors hover:bg-white/60"
                >
                  {/* Thumbnail */}
                  <div
                    className="flex h-[44px] w-[34px] shrink-0 items-center justify-center rounded-[5px] bg-white"
                    style={{
                      boxShadow:
                        "0px 1px 1px 0px rgba(0,0,0,0.04), 0px 3px 3px 0px rgba(0,0,0,0.04), 0px 6px 4px 0px rgba(0,0,0,0.02), 0px 11px 4px 0px rgba(0,0,0,0.01), 0px 0px 0px 1px rgba(0,0,0,0.03)",
                    }}
                  >
                    {item.type === "LINK" ? (
                      <Globe size={13} className="text-ink-muted/60" />
                    ) : item.type === "NOTE" ? (
                      <ClipboardPaste
                        size={13}
                        className="text-ink-muted/60"
                      />
                    ) : (
                      <FileText size={13} className="text-ink-muted/60" />
                    )}
                  </div>

                  {/* Name & preview */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-app text-[13px] font-medium">
                      {item.name}
                    </p>
                    <p className="mt-0.5 truncate font-app text-[12px] text-ink-muted/60">
                      {item.preview}
                    </p>
                  </div>

                  {/* Type */}
                  <span className="w-12 text-center font-app text-[11px] font-medium text-ink-muted">
                    {item.type}
                  </span>

                  {/* Dates */}
                  <span className="hidden w-24 text-right font-app text-[12px] text-ink-muted md:block">
                    {item.added}
                  </span>
                  <span className="hidden w-24 text-right font-app text-[12px] text-ink-muted md:block">
                    {item.lastViewed}
                  </span>

                  {/* More button */}
                  <button
                    className="w-8 rounded-md p-1.5 text-ink-muted opacity-0 transition-all hover:bg-cream-dark/60 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </a>
              ))}
            </div>
          </div>
        ) : (
          /* ─── Grid View ─── */
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {content.map((item) => (
              <a
                key={item.id}
                href="#"
                className="group flex flex-col rounded-2xl border border-black/5 bg-white p-4 transition-all hover:border-black/10 hover:shadow-md"
              >
                <div
                  className="flex h-[56px] w-[44px] items-center justify-center rounded-[5px] bg-cream-dark/30"
                  style={{
                    boxShadow:
                      "0px 1px 1px 0px rgba(0,0,0,0.04), 0px 3px 3px 0px rgba(0,0,0,0.04), 0px 6px 4px 0px rgba(0,0,0,0.02), 0px 0px 0px 1px rgba(0,0,0,0.03)",
                  }}
                >
                  <FileText size={16} className="text-ink-muted/60" />
                </div>
                <p className="mt-3 truncate font-app text-[13px] font-medium">
                  {item.name}
                </p>
                <p className="mt-1 font-app text-[11px] text-ink-muted">
                  {item.type} &middot; {item.added}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ─── Learning Bar (sticky bottom) ─── */}
      <div className="sticky bottom-0 z-10">
        <div className="pointer-events-none h-8 bg-gradient-to-t from-[#FAF7F4] to-transparent" />
        <div className="bg-[#FAF7F4] px-1 pb-3">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-black/18 focus-within:shadow-md">
              <Sparkles size={16} className="shrink-0 text-ink-muted/60" />
              <input
                type="text"
                value={learningQuery}
                onChange={(e) => setLearningQuery(e.target.value)}
                placeholder="What do you want to learn about?"
                className="w-full bg-transparent font-app text-[13px] outline-none placeholder:text-ink-muted/60"
              />
              <button
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  learningQuery
                    ? "bg-ink text-white hover:bg-ink/80"
                    : "bg-cream-dark text-ink-muted"
                }`}
              >
                <ArrowRight size={14} />
              </button>
            </div>
            <p className="mt-2 text-center font-app text-[11px] text-ink-muted/50">
              Ask a question, start a guided lesson, or get quizzed on your
              materials
            </p>
          </div>
        </div>
      </div>

      {/* ─── Upload Modal ─── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setUploadModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-black/8 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-app-heading text-[17px]">Add Content</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cream-dark/50 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); /* handle files */ }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragOver
                  ? "border-ink/30 bg-cream-dark/40"
                  : "border-black/10 bg-cream-dark/15"
              }`}
            >
              <CloudUpload size={32} strokeWidth={1.2} className="mb-3 text-ink-muted" />
              <p className="font-app text-[14px] font-medium">
                Drop files here
              </p>
              <p className="mt-1 font-app text-[12px] text-ink-muted">
                or click to browse
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.pptx,.txt,.mp3,.mp4"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={() => { /* handle file select */ }}
              />
            </div>

            <p className="mt-3 text-center font-app text-[11px] text-ink-muted/60">
              PDF, DOCX, PPTX, TXT, MP3 &middot; Max 50MB
            </p>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/5" />
              <span className="font-app text-[11px] text-ink-muted">or add a link</span>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            {/* URL input */}
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-black/8 bg-cream-dark/15 px-4 py-2.5 transition-colors focus-within:border-black/15 focus-within:bg-white">
                <Link2 size={15} className="shrink-0 text-ink-muted" />
                <input
                  type="url"
                  placeholder="Paste a YouTube or website URL..."
                  className="w-full bg-transparent font-app text-[13px] outline-none placeholder:text-ink-muted/60"
                />
              </div>
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition-colors hover:bg-ink/80">
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Paste Toast ─── */}
      {pasteToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-5 py-3.5 shadow-xl">
            {pasteToast.isUrl ? (
              <Globe size={16} className="shrink-0 text-ink-light" />
            ) : (
              <ClipboardPaste size={16} className="shrink-0 text-ink-light" />
            )}
            <div className="max-w-xs">
              <p className="font-app text-[12px] font-medium">
                {pasteToast.isUrl ? "Add this link?" : "Save as note?"}
              </p>
              <p className="mt-0.5 truncate font-app text-[12px] text-ink-muted">
                {pasteToast.text.slice(0, 80)}
                {pasteToast.text.length > 80 && "..."}
              </p>
            </div>
            <div className="ml-3 flex items-center gap-1.5">
              <button
                onClick={handleAcceptPaste}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink/80"
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => setPasteToast(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-dark text-ink-muted transition-colors hover:text-ink"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
