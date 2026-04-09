"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Trash2,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { uploadDocument, deleteDocumentFile } from "@/lib/uploadDocument";
import { useProcessing } from "@/lib/ProcessingContext";

/* ─── Types ─── */

interface ContentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  preview: string;
  added: string;
  lastViewed: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const PAGE_SIZE = 20;

/* ─── Component ─── */

export default function SubjectPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const { addJob } = useProcessing();

  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [subjectIcon, setSubjectIcon] = useState("");
  const [subjectMetaLoading, setSubjectMetaLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pasteToast, setPasteToast] = useState<{
    text: string;
    isUrl: boolean;
  } | null>(null);
  const [learningQuery, setLearningQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docMenuId, setDocMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const addMenuRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isEmpty = content.length === 0 && !loading;

  const mapDocs = (docs: any[]): ContentItem[] =>
    docs.map((d) => ({
      id: d.id,
      name: d.title,
      type: d.type.toUpperCase(),
      status: d.status || "ready",
      preview: d.raw_text?.slice(0, 120) || "",
      added: timeAgo(d.created_at),
      lastViewed: d.last_viewed_at ? timeAgo(d.last_viewed_at) : "—",
    }));

  /* Load subject + documents from DB (parallel, paginated) */
  useEffect(() => {
    if (authLoading || !user) return;

    // Reset states on id change to prevent stale/flash
    setSubjectName("");
    setSubjectDesc("");
    setSubjectIcon("");
    setSubjectMetaLoading(true);
    setContent([]);
    setLoading(true);
    setHasMore(false);

    const fetchData = async () => {
      const [subjectResult, docsResult] = await Promise.all([
        supabase
          .from("subjects")
          .select("name, description, icon")
          .eq("id", id)
          .single(),
        supabase
          .from("documents")
          .select("id, title, type, status, raw_text, created_at, last_viewed_at")
          .eq("subject_id", id)
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1),
      ]);

      if (subjectResult.data) {
        setSubjectName(subjectResult.data.name);
        setSubjectDesc(subjectResult.data.description || "");
        setSubjectIcon(subjectResult.data.icon || "\u{1F4DA}");
      } else {
        // No row found — use defaults only as true fallback
        setSubjectName("Untitled Subject");
        setSubjectIcon("\u{1F4DA}");
      }
      setSubjectMetaLoading(false);

      if (docsResult.data) {
        setContent(mapDocs(docsResult.data));
        setHasMore(docsResult.data.length === PAGE_SIZE);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, authLoading, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    setLoadingMore(true);
    const { data } = await supabase
      .from("documents")
      .select("id, title, type, status, raw_text, created_at, last_viewed_at")
      .eq("subject_id", id)
      .order("created_at", { ascending: false })
      .range(content.length, content.length + PAGE_SIZE - 1);

    if (data) {
      setContent((prev) => [...prev, ...mapDocs(data)]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  };

  /* Auto-save subject name/description (debounced) */
  const saveSubject = useCallback(
    (name: string, desc: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        await supabase
          .from("subjects")
          .update({ name, description: desc, updated_at: new Date().toISOString() })
          .eq("id", id);
        window.dispatchEvent(new CustomEvent("subject-updated", { detail: { id, name } }));
      }, 800);
    },
    [id, supabase]
  );

  const handleNameChange = (val: string) => {
    setSubjectName(val);
    saveSubject(val, subjectDesc);
  };

  const handleDescChange = (val: string) => {
    setSubjectDesc(val);
    saveSubject(subjectName, val);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(true);
    setUploadError(null);
    let hasError = false;

    for (const file of Array.from(files)) {
      console.log("Uploading:", file.name, file.type, file.size);
      const result = await uploadDocument(supabase, file, user.id, id);

      if (result.error) {
        console.error("Upload error:", result.error);
        setUploadError(result.error);
        hasError = true;
        continue;
      }

      console.log("Upload success:", result.documentId, result.title);

      // Track processing in toast
      addJob(result.documentId, result.title);

      // Navigate to the document page immediately (single file)
      if (files.length === 1) {
        setUploading(false);
        setUploadModalOpen(false);
        router.push(`/subject/${id}/doc/${result.documentId}`);
        return;
      }

      // Multiple files: add to content list
      setContent((prev) => [
        {
          id: result.documentId,
          name: result.title,
          type: "PDF",
          status: "processing",
          preview: "",
          added: "Just now",
          lastViewed: "—",
        },
        ...prev,
      ]);
    }

    setUploading(false);
    if (!hasError) setUploadModalOpen(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteDocument = async (docId: string) => {
    setDocMenuId(null);
    // Get file_path before deleting the row
    const { data } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", docId)
      .single();

    // Delete DB row
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId);

    if (!error) {
      setContent((prev) => prev.filter((c) => c.id !== docId));
      // Delete storage file
      if (data?.file_path) {
        await deleteDocumentFile(supabase, data.file_path);
      }
    }
  };

  const startRename = (item: ContentItem) => {
    setDocMenuId(null);
    setRenamingId(item.id);
    setRenameValue(item.name);
  };

  const commitRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    await supabase
      .from("documents")
      .update({ title: renameValue.trim(), updated_at: new Date().toISOString() })
      .eq("id", renamingId);

    setContent((prev) =>
      prev.map((c) => (c.id === renamingId ? { ...c, name: renameValue.trim() } : c))
    );
    setRenamingId(null);
  };

  // Close doc menu on outside click
  useEffect(() => {
    if (!docMenuId) return;
    const close = () => setDocMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [docMenuId]);

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
      status: "ready",
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
          {subjectMetaLoading ? (
            <div className="animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded bg-cream-dark" />
                <div className="h-7 w-48 rounded-lg bg-cream-dark" />
              </div>
              <div className="mt-2 ml-[30px] h-4 w-64 rounded bg-cream-dark" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{subjectIcon}</span>
                <div className="flex items-baseline gap-2">
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Untitled Subject"
                    className="font-app-heading text-[22px] tracking-tight bg-transparent outline-none rounded-lg px-2 -mx-2 py-0.5 border border-transparent hover:border-black/8 focus:border-black/15 focus:bg-white/60 placeholder:text-ink-muted/40 w-auto transition-colors"
                    style={{ width: `${Math.max(subjectName.length + 2, 10)}ch` }}
                  />
                  {content.length > 0 && (
                    <span className="text-[15px] font-normal text-ink-muted">
                      ({content.length}{hasMore ? "+" : ""})
                    </span>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={subjectDesc}
                onChange={(e) => handleDescChange(e.target.value)}
                placeholder="Add a description..."
                className="mt-1 ml-[30px] font-app text-[13px] text-ink-muted bg-transparent outline-none rounded-lg px-2 py-0.5 border border-transparent hover:border-black/8 focus:border-black/15 focus:bg-white/60 placeholder:text-ink-muted/40 placeholder:italic w-full transition-colors"
              />
            </>
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
      <div className="mt-6 flex-1 pb-40">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 px-3 py-3">
                <div className="h-[44px] w-[34px] rounded-[5px] bg-cream-dark" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-cream-dark" />
                  <div className="h-3 w-1/3 rounded bg-cream-dark" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && isEmpty ? (
          /* ─── Empty State ─── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="font-app-heading text-[22px]">
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
        ) : !loading && viewMode === "list" ? (
          /* ─── List View ─── */
          <div>
            {/* Column headers */}
            <div className="flex items-center gap-4 border-b border-black/5 px-3 pb-2.5 font-app text-[13px] text-ink-muted">
              <span className="flex-1">Name</span>
              <span className="w-14 text-center">Type</span>
              <span className="hidden w-28 text-right md:block">Added</span>
              <span className="hidden w-28 text-right md:block">Viewed</span>
              <span className="w-8" />
            </div>

            {/* Rows */}
            <div>
              {content.map((item) => (
                <div key={item.id} className="relative">
                  <Link
                    href={`/subject/${id}/doc/${item.id}`}
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
                      {renamingId === item.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          className="w-full truncate rounded-md border border-black/10 bg-white px-2 py-0.5 font-app text-[14px] font-medium outline-none focus:border-black/20"
                        />
                      ) : (
                        <p
                          className="truncate font-app text-[14px] font-medium"
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startRename(item);
                          }}
                        >
                          {item.name}
                        </p>
                      )}
                      <p className="mt-0.5 truncate font-app text-[12px] text-ink-muted/60">
                        {item.preview}
                      </p>
                    </div>

                    {/* Type + status */}
                    <span className="w-14 text-center font-app text-[13px] font-medium text-ink-muted">
                      {item.status === "processing" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                          Indexing
                        </span>
                      ) : item.status === "error" ? (
                        <span className="text-[11px] text-red-500">Error</span>
                      ) : (
                        item.type
                      )}
                    </span>

                    {/* Dates */}
                    <span className="hidden w-28 text-right font-app text-[13px] text-ink-muted md:block">
                      {item.added}
                    </span>
                    <span className="hidden w-28 text-right font-app text-[13px] text-ink-muted md:block">
                      {item.lastViewed}
                    </span>

                    {/* More button */}
                    <button
                      className="w-8 rounded-md p-1.5 text-ink-muted opacity-0 transition-all hover:bg-cream-dark/60 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDocMenuId(docMenuId === item.id ? null : item.id);
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </Link>

                  {/* Dropdown menu */}
                  {docMenuId === item.id && (
                    <div
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="absolute right-2 top-12 z-20 min-w-[140px] rounded-xl border border-black/8 bg-white py-1 shadow-lg"
                    >
                      <button
                        onClick={() => startRename(item)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-light transition-colors hover:bg-cream-dark/50"
                      >
                        <Pencil size={13} />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(item.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="font-app text-[13px] text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        ) : !loading ? (
          /* ─── Grid View ─── */
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/subject/${id}/doc/${item.id}`}
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
                </Link>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="font-app text-[13px] text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ─── Learning Bar (sticky bottom) ─── */}
      <div className="sticky bottom-0 z-10">
        <div className="pointer-events-none h-16 bg-gradient-to-t from-[#FAF7F4] to-transparent" />
        <div className="bg-[#FAF7F4] px-1 pb-3">
          <div className="mx-auto max-w-2xl">
            <label className="flex cursor-text items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-black/18 focus-within:shadow-md">
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
            </label>
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
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragOver
                  ? "border-ink/30 bg-cream-dark/40"
                  : uploading
                    ? "border-black/10 bg-cream-dark/30"
                    : "border-black/10 bg-cream-dark/15"
              }`}
            >
              {uploading ? (
                <>
                  <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-ink-muted/20 border-t-ink" />
                  <p className="font-app text-[14px] font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <CloudUpload size={32} strokeWidth={1.2} className="mb-3 text-ink-muted" />
                  <p className="font-app text-[14px] font-medium">
                    Drop PDF here
                  </p>
                  <p className="mt-1 font-app text-[12px] text-ink-muted">
                    or click to browse
                  </p>
                </>
              )}
              <input
                type="file"
                multiple
                accept=".pdf"
                disabled={uploading}
                className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-wait"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {uploadError && (
              <p className="mt-2 text-center font-app text-[12px] text-red-600">
                {uploadError}
              </p>
            )}

            <p className="mt-3 text-center font-app text-[11px] text-ink-muted/60">
              PDF only &middot; Max 50MB
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
