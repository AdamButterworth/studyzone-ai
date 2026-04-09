"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MessageSquare,
  FileText,
  ListChecks,
  StickyNote,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Download,
  MoreHorizontal,
  Plus,
  GripVertical,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Search,
  Maximize2,
  Minimize2,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTopBar } from "@/lib/TopBarContext";

const PdfViewer = dynamic(() => import("@/components/app/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl bg-white"
          style={{
            width: "100%",
            maxWidth: 720,
            aspectRatio: "1 / 1.414",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
        />
      ))}
    </div>
  ),
});

/* ─── Types ─── */

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

interface LessonStep {
  title: string;
  time: string;
  description: string;
  done: boolean;
}

type TabType = "chat" | "summary" | "notes" | "lesson";

interface Tab {
  id: string;
  type: TabType;
  label: string;
}

interface SavedSet {
  id: string;
  type: TabType;
  title: string;
  detail: string;
}

/* ─── Tool options (only 4) ─── */

const TAB_OPTIONS: {
  type: TabType;
  label: string;
  desc: string;
  icon: typeof MessageSquare;
  color: string;
  iconColor: string;
}[] = [
  {
    type: "chat",
    label: "Chat",
    desc: "Ask questions",
    icon: MessageSquare,
    color: "bg-cream-dark/50",
    iconColor: "text-ink/60",
  },
  {
    type: "summary",
    label: "Summary",
    desc: "Key concepts",
    icon: FileText,
    color: "bg-sky-light/60",
    iconColor: "text-sky/70",
  },
  {
    type: "notes",
    label: "Notes",
    desc: "Your notes",
    icon: StickyNote,
    color: "bg-mint-light/60",
    iconColor: "text-mint/70",
  },
  {
    type: "lesson",
    label: "Lesson Plan",
    desc: "Guided learning",
    icon: ListChecks,
    color: "bg-peach-light/60",
    iconColor: "text-peach/70",
  },
];

const MOCK_LESSON: LessonStep[] = [
  {
    title: "Foundations",
    time: "5 min",
    description:
      "Why direct policy optimization? Value-based vs policy-based methods.",
    done: true,
  },
  {
    title: "The Policy Gradient Theorem",
    time: "8 min",
    description:
      "Derivation and intuition behind the score function estimator.",
    done: true,
  },
  {
    title: "REINFORCE Algorithm",
    time: "7 min",
    description:
      "Monte Carlo policy gradients. Implementation and limitations.",
    done: false,
  },
  {
    title: "Variance Reduction",
    time: "5 min",
    description: "Baselines, advantages, and why they matter for training.",
    done: false,
  },
  {
    title: "Actor-Critic Methods",
    time: "10 min",
    description: "Combining policy and value learning. The A2C architecture.",
    done: false,
  },
  {
    title: "PPO Deep Dive",
    time: "10 min",
    description:
      "Clipped objectives, implementation details, and real-world usage.",
    done: false,
  },
];

/* ═══════════════════════════════════════ */
/* ─── Main Component ─── */
/* ═══════════════════════════════════════ */

export default function DocumentPage() {
  const params = useParams();
  const subjectId = params.id as string;
  const docId = params.docId as string;
  const supabase = createClient();
  const { user } = useAuth();
  const { setBreadcrumb } = useTopBar();

  /* ── Document data ── */
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("Document");
  const [subjectName, setSubjectName] = useState("");
  const [docLoading, setDocLoading] = useState(true);
  const titleSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchDoc = async () => {
      const [docResult, subjectResult] = await Promise.all([
        supabase
          .from("documents")
          .select("title, file_path, status")
          .eq("id", docId)
          .single(),
        supabase
          .from("subjects")
          .select("name")
          .eq("id", subjectId)
          .single(),
      ]);

      if (subjectResult.data?.name) setSubjectName(subjectResult.data.name);
      if (docResult.data?.title) setDocTitle(docResult.data.title);

      if (docResult.data?.file_path && docResult.data.status !== "uploading") {
        const { data: urlData } = await supabase.storage
          .from("documents")
          .createSignedUrl(docResult.data.file_path, 3600);
        if (urlData?.signedUrl) setPdfUrl(urlData.signedUrl);
      }
      setDocLoading(false);
    };
    fetchDoc();
  }, [user, docId, subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (val: string) => {
    setDocTitle(val);
    if (titleSaveRef.current) clearTimeout(titleSaveRef.current);
    titleSaveRef.current = setTimeout(async () => {
      await supabase
        .from("documents")
        .update({ title: val, updated_at: new Date().toISOString() })
        .eq("id", docId);
    }, 800);
  };

  const handleDownload = useCallback(async () => {
    if (!pdfUrl) return;
    const res = await fetch(pdfUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pdfUrl, docTitle]);

  // Sync breadcrumb to top bar
  useEffect(() => {
    setBreadcrumb({
      subjectId,
      subjectName: subjectName || "Subject",
      docTitle,
      onTitleChange: handleTitleChange,
      onDownload: pdfUrl ? handleDownload : undefined,
    });
  }, [subjectId, subjectName, docTitle, pdfUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear breadcrumb on unmount
  useEffect(() => {
    return () => setBreadcrumb(null);
  }, [setBreadcrumb]);

  /* ── Resizable panel ── */
  const [rightWidth, setRightWidth] = useState(480);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const pendingRightWidthRef = useRef<number | null>(null);
  const dragWidthRafRef = useRef<number | null>(null);
  const pdfWidthRafRef = useRef<number | null>(null);
  const pendingPdfBaseWidthRef = useRef<number | null>(null);

  const flushRightPanelWidth = useCallback((nextWidth: number) => {
    pendingRightWidthRef.current = nextWidth;
    if (rightPanelRef.current) {
      rightPanelRef.current.style.width = `${nextWidth}px`;
    }
  }, []);

  const startDrag = useCallback(() => {
    isDragging.current = true;
    pendingRightWidthRef.current = rightWidth;
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [rightWidth]);

  useLayoutEffect(() => {
    if (!rightPanelRef.current) return;
    rightPanelRef.current.style.width = isFullscreen ? "0px" : `${rightWidth}px`;
  }, [isFullscreen, rightWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newW = rect.right - e.clientX;
      const clampedWidth = Math.max(340, Math.min(rect.width * 0.55, newW));
      pendingRightWidthRef.current = clampedWidth;
      if (dragWidthRafRef.current !== null) return;
      dragWidthRafRef.current = requestAnimationFrame(() => {
        dragWidthRafRef.current = null;
        const nextWidth = pendingRightWidthRef.current;
        if (typeof nextWidth === "number") {
          flushRightPanelWidth(nextWidth);
        }
      });
    };
    const onUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (dragWidthRafRef.current !== null) {
          cancelAnimationFrame(dragWidthRafRef.current);
          dragWidthRafRef.current = null;
        }
        const finalWidth = pendingRightWidthRef.current ?? rightWidth;
        flushRightPanelWidth(finalWidth);
        setRightWidth(finalWidth);
        setDragging(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      if (dragWidthRafRef.current !== null) {
        cancelAnimationFrame(dragWidthRafRef.current);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [flushRightPanelWidth, rightWidth]);

  /* ── Tabs ── */
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node))
        setShowAddMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addTab = (type: TabType) => {
    // Reuse existing tab for summary/notes/lesson (not chat — multiple allowed)
    if (type !== "chat") {
      const existing = tabs.find((t) => t.type === type);
      if (existing) {
        setActiveTabId(existing.id);
        setShowAddMenu(false);
        return;
      }
    }
    const opt = TAB_OPTIONS.find((o) => o.type === type)!;
    const newTab: Tab = { id: Date.now().toString(), type, label: opt.label };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setShowAddMenu(false);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
      }
      return filtered;
    });
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isHome = !activeTab;

  /* ── Tab state ── */
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  /* ── Summary state ── */
  const [summaryContent, setSummaryContent] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryGenerating, setSummaryGenerating] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryChecked, setSummaryChecked] = useState(false);

  /* ── Resources (real data for Learn tab) ── */
  const [savedResources, setSavedResources] = useState<SavedSet[]>([]);
  const [resourceMenuId, setResourceMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceMenuId) return;
    const close = () => setResourceMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [resourceMenuId]);

  const handleDeleteResource = async (resourceId: string) => {
    setResourceMenuId(null);
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("document_summaries")
      .delete()
      .eq("id", resourceId);

    if (!error) {
      setSavedResources((prev) => prev.filter((r) => r.id !== resourceId));
      // Reset summary state so it regenerates on next open
      setSummaryContent(null);
      setSummaryChecked(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchResources = async () => {
      const { data } = await supabase
        .from("document_summaries")
        .select("id, created_at")
        .eq("document_id", docId)
        .order("created_at", { ascending: false });

      if (data) {
        const resources: SavedSet[] = data.map((s: { id: string; created_at: string }) => ({
          id: s.id,
          type: "summary" as TabType,
          title: `Summary`,
          detail: new Date(s.created_at).toLocaleDateString(),
        }));
        setSavedResources(resources);
      }
    };
    fetchResources();
  }, [user, docId, summaryGenerating]); // eslint-disable-line react-hooks/exhaustive-deps
  const [lessonSteps, setLessonSteps] = useState(MOCK_LESSON);
  const [notes, setNotes] = useState("");
  const [homeQuery, setHomeQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPage, setEditingPage] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [scrollToPage, setScrollToPage] = useState<number | undefined>();
  const [zoom, setZoom] = useState(1);
  const [pdfBaseWidth, setPdfBaseWidth] = useState(0);
  const [stablePdfRenderWidth, setStablePdfRenderWidth] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.15;
  const MIN_PDF_RENDER_WIDTH = 960;

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !pdfScrollRef.current) {
      setSearchResultCount(null);
      return;
    }
    // Clear previous highlights
    pdfScrollRef.current.querySelectorAll("mark[data-pdf-search]").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });

    const query = searchQuery.trim().toLowerCase();
    const textSpans = pdfScrollRef.current.querySelectorAll(".react-pdf__Page__textContent span");
    let count = 0;
    let firstMatch: Element | null = null;

    textSpans.forEach((span) => {
      const text = span.textContent || "";
      if (text.toLowerCase().includes(query)) {
        // Wrap matches in mark tags
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        const parts = text.split(regex);
        if (parts.length > 1) {
          span.textContent = "";
          parts.forEach((part) => {
            if (part.toLowerCase() === query) {
              const mark = document.createElement("mark");
              mark.setAttribute("data-pdf-search", "true");
              mark.style.backgroundColor = "rgba(255, 200, 0, 0.45)";
              mark.style.borderRadius = "2px";
              mark.textContent = part;
              span.appendChild(mark);
              count++;
              if (!firstMatch) firstMatch = mark;
            } else {
              span.appendChild(document.createTextNode(part));
            }
          });
        }
      }
    });

    setSearchResultCount(count);
    if (firstMatch) {
      (firstMatch as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Clear highlights when search closes
  useEffect(() => {
    if (!searchOpen && pdfScrollRef.current) {
      pdfScrollRef.current.querySelectorAll("mark[data-pdf-search]").forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ""), el);
          parent.normalize();
        }
      });
      setSearchQuery("");
      setSearchResultCount(null);
    }
  }, [searchOpen]);

  // Measure the scroll container width — stable regardless of content size
  useEffect(() => {
    if (!pdfScrollRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use clientWidth to exclude scrollbar width, subtract padding (px-4 = 32px)
        pendingPdfBaseWidthRef.current = entry.target.clientWidth - 32;
        if (pdfWidthRafRef.current !== null) return;
        pdfWidthRafRef.current = requestAnimationFrame(() => {
          pdfWidthRafRef.current = null;
          const nextWidth = pendingPdfBaseWidthRef.current;
          if (typeof nextWidth === "number") {
            setPdfBaseWidth((prev) =>
              Math.abs(prev - nextWidth) < 0.5 ? prev : nextWidth
            );
          }
        });
      }
    });
    observer.observe(pdfScrollRef.current);
    return () => {
      observer.disconnect();
      if (pdfWidthRafRef.current !== null) {
        cancelAnimationFrame(pdfWidthRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pdfBaseWidth > 0 && stablePdfRenderWidth === 0) {
      setStablePdfRenderWidth(Math.max(pdfBaseWidth, MIN_PDF_RENDER_WIDTH));
    }
  }, [pdfBaseWidth, stablePdfRenderWidth]);

  useEffect(() => {
    setStablePdfRenderWidth(0);
  }, [pdfUrl]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChatMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", text: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          document_id: docId,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: `Error: ${err.error || "Something went wrong"}` } : m))
        );
        setChatLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const { text: chunk } = JSON.parse(data);
            if (chunk) {
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + chunk } : m))
              );
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsgId ? { ...m, text: "Failed to get a response. Please try again." } : m))
      );
    }

    setChatLoading(false);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    sendChatMessage(text);
  };

  const handleHomeAsk = () => {
    if (!homeQuery.trim()) return;
    const text = homeQuery;
    setHomeQuery("");
    // Open a new chat tab with the question
    const newTab: Tab = { id: Date.now().toString(), type: "chat", label: "Chat" };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    sendChatMessage(text);
  };

  /* ── Summary: fetch existing or auto-generate ── */
  useEffect(() => {
    if (activeTab?.type !== "summary" || summaryChecked || !user) return;

    const checkExisting = async () => {
      setSummaryLoading(true);
      const { data } = await supabase
        .from("document_summaries")
        .select("content")
        .eq("document_id", docId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.content) {
        setSummaryContent(data.content);
        setSummaryLoading(false);
        setSummaryChecked(true);
      } else {
        setSummaryLoading(false);
        setSummaryChecked(true);
        generateSummary();
      }
    };

    checkExisting();
  }, [activeTab?.type, summaryChecked, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateSummary = async () => {
    if (!user) return;
    setSummaryGenerating(true);
    setSummaryError(null);
    setSummaryContent("");

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: docId, user_id: user.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        setSummaryError(err.error || "Failed to generate summary");
        setSummaryContent(null);
        setSummaryGenerating(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const { text: chunk } = JSON.parse(data);
            if (chunk) {
              fullText += chunk;
              setSummaryContent(fullText);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setSummaryError("Failed to generate summary. Please try again.");
      setSummaryContent(null);
    }

    setSummaryGenerating(false);
  };

  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
  }, []);

  const goToPage = (page: number) => {
    setScrollToPage(page);
    setCurrentPage(page);
  };

  const doneCount = lessonSteps.filter((s) => s.done).length;
  const renderBaseWidth =
    stablePdfRenderWidth > 0
      ? stablePdfRenderWidth
      : pdfBaseWidth > 0
        ? Math.max(pdfBaseWidth, MIN_PDF_RENDER_WIDTH)
        : 0;
  const renderPdfWidth =
    renderBaseWidth > 0 ? renderBaseWidth * zoom : undefined;
  const livePdfScale =
    renderBaseWidth > 0 && pdfBaseWidth > 0
      ? pdfBaseWidth / renderBaseWidth
      : 1;

  return (
    <div
      ref={containerRef}
      className="-mx-5 -my-6 flex md:-mx-8"
      style={{ height: "calc(100vh - 3.5rem)" }}
    >
      {/* ════════ LEFT: Document Viewer ════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#EEEAE5]">
        {/* PDF toolbar */}
        <div className="flex shrink-0 items-center gap-3 border-b border-black/5 bg-white/60 px-5 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="rounded p-1 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
            {editingPage ? (
              <span className="flex items-center gap-0.5 font-app text-[12px] tabular-nums text-ink-light">
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => {
                    const num = parseInt(pageInputValue, 10);
                    if (num >= 1 && num <= totalPages) goToPage(num);
                    setEditingPage(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const num = parseInt(pageInputValue, 10);
                      if (num >= 1 && num <= totalPages) goToPage(num);
                      setEditingPage(false);
                    }
                    if (e.key === "Escape") setEditingPage(false);
                  }}
                  className="w-8 rounded border border-black/10 bg-white px-1 py-0.5 text-center text-[12px] outline-none focus:border-black/20"
                />
                <span>/ {totalPages}</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setPageInputValue(String(currentPage));
                  setEditingPage(true);
                }}
                className="font-app text-[12px] tabular-nums text-ink-light hover:text-ink transition-colors"
              >
                {totalPages > 0 ? `${currentPage} / ${totalPages}` : "—"}
              </button>
            )}
            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="rounded p-1 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="mx-1 h-4 w-px bg-black/8" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              disabled={zoom <= ZOOM_MIN}
              className="rounded p-1 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-30"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="font-app text-[12px] tabular-nums text-ink-light w-10 text-center hover:text-ink transition-colors"
              title="Reset to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              disabled={zoom >= ZOOM_MAX}
              className="rounded p-1 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-30"
            >
              <ZoomIn size={13} />
            </button>
          </div>
          <div className="mx-1 h-4 w-px bg-black/8" />
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`rounded p-1.5 transition-colors hover:bg-black/5 ${searchOpen ? "text-ink bg-black/5" : "text-ink-muted hover:text-ink"}`}
            title="Search"
          >
            <Search size={13} />
          </button>
          <button
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="rounded p-1.5 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-30"
            title="Download"
          >
            <Download size={13} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded p-1.5 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="flex shrink-0 items-center gap-2 border-b border-black/5 bg-white/80 px-5 py-2 backdrop-blur-sm">
            <Search size={13} className="shrink-0 text-ink-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search in document..."
              className="flex-1 bg-transparent font-app text-[13px] outline-none placeholder:text-ink-muted/50"
            />
            {searchResultCount !== null && (
              <span className="font-app text-[11px] text-ink-muted">
                {searchResultCount} {searchResultCount === 1 ? "match" : "matches"}
              </span>
            )}
            <button
              onClick={() => setSearchOpen(false)}
              className="rounded p-1 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Document content */}
        <div ref={pdfScrollRef} className="flex-1 overflow-y-auto overflow-x-auto px-4 py-4">
          {docLoading ? (
            <div className="flex flex-col items-center gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg bg-white"
                  style={{ width: "100%", aspectRatio: "1 / 1.414", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
                />
              ))}
            </div>
          ) : pdfUrl ? (
            <PdfViewer
              url={pdfUrl}
              onPageChange={handlePageChange}
              currentPage={scrollToPage}
              pageWidth={renderPdfWidth}
              displayScale={livePdfScale}
              renderAllPages={searchOpen || searchQuery.trim().length > 0}
              initialRenderCount={3}
              renderBatchSize={4}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-app text-[14px] font-medium text-ink">No PDF available</p>
              <p className="mt-1 font-app text-[13px] text-ink-muted">This document has no file attached yet.</p>
            </div>
          )}
          <div className="h-4" />
        </div>
      </div>

      {/* ════════ DRAGGABLE DIVIDER ════════ */}
      <div
        onMouseDown={startDrag}
        className={`group relative z-10 w-0 shrink-0 cursor-col-resize ${isFullscreen ? "hidden" : ""}`}
      >
        <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-black/[0.06] transition-colors group-hover:bg-black/[0.14] group-active:bg-black/20" />
        <div className="absolute inset-y-0 -left-2 w-5" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical size={12} className="text-ink-muted/50" />
        </div>
      </div>

      {/* ════════ RIGHT: AI Tools Panel ════════ */}
      <div
        ref={rightPanelRef}
        className={`flex shrink-0 flex-col overflow-hidden bg-white ${dragging ? "" : "transition-[width] duration-300"} ${isFullscreen ? "w-0" : ""}`}
      >
        {/* Tab bar — only show when tabs exist */}
        {tabs.length > 0 && (
          <div className="relative z-10 flex shrink-0 items-center px-3 py-2">
            {/* Home button */}
            <button
              onClick={() => setActiveTabId(null)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-app text-[12px] font-medium transition-all ${
                isHome
                  ? "bg-cream-dark/60 text-ink ring-1 ring-black/[0.04]"
                  : "text-ink-muted hover:bg-cream-dark/30 hover:text-ink-light hover:ring-1 hover:ring-black/[0.03]"
              }`}
            >
              <Sparkles size={13} />
              Learn
            </button>

            <div className="mx-1 h-4 w-px bg-black/6" />

            {/* Open tabs */}
            <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
              {tabs.map((tab) => {
                const opt = TAB_OPTIONS.find((o) => o.type === tab.type);
                const Icon = opt?.icon || MessageSquare;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`group/tab flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-app text-[12px] font-medium transition-all ${
                      activeTabId === tab.id
                        ? "bg-cream-dark/60 text-ink ring-1 ring-black/[0.04]"
                        : "text-ink-muted hover:bg-cream-dark/30 hover:text-ink-light hover:ring-1 hover:ring-black/[0.03]"
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                    <span
                      onClick={(e) => closeTab(tab.id, e)}
                      className="ml-0.5 rounded p-0.5 opacity-0 transition-all hover:bg-cream-dark/60 group-hover/tab:opacity-100"
                    >
                      <X size={10} />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add tab */}
            <div className="relative shrink-0" ref={addMenuRef}>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cream-dark/50 hover:text-ink"
              >
                <Plus size={15} />
              </button>
              {showAddMenu && (
                <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-black/8 bg-white p-2 shadow-xl">
                  <div className="space-y-0.5">
                    {TAB_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => addTab(opt.type)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-cream-dark/40"
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${opt.color}`}
                        >
                          <opt.icon size={14} className={opt.iconColor} />
                        </div>
                        <span className="font-app text-[13px] font-medium">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ═══ HOME VIEW ═══ */}
          {isHome && (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 px-5 py-5">
                {/* Generate section */}
                <p className="mb-3 font-app text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Generate
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TAB_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => addTab(opt.type)}
                      className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 text-left transition-all hover:border-black/10 hover:shadow-sm"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opt.color}`}
                      >
                        <opt.icon size={18} className={opt.iconColor} />
                      </div>
                      <div>
                        <p className="font-app text-[13px] font-medium">
                          {opt.label}
                        </p>
                        <p className="font-app text-[11px] text-ink-muted">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* My Resources */}
                <div className="mt-7">
                  <p className="mb-3 font-app text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    My Resources
                  </p>
                  {savedResources.length === 0 && (
                    <p className="px-3 py-2 font-app text-[12px] text-ink-muted/50">
                      No resources yet — try generating a summary
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {savedResources.map((set) => {
                      const opt = TAB_OPTIONS.find(
                        (o) => o.type === set.type
                      );
                      const Icon = opt?.icon || FileText;
                      return (
                        <div key={set.id} className="relative">
                          <button
                            onClick={() => addTab(set.type)}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cream-dark/30"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${opt?.color || "bg-cream-dark/50"}`}
                            >
                              <Icon
                                size={14}
                                className={opt?.iconColor || "text-ink-muted"}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-app text-[13px] font-medium">
                                {set.title}
                              </p>
                              <p className="font-app text-[11px] text-ink-muted">
                                {set.detail}
                              </p>
                            </div>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setResourceMenuId(resourceMenuId === set.id ? null : set.id);
                              }}
                              className="shrink-0 rounded-md p-1 text-ink-muted opacity-0 transition-all hover:bg-cream-dark/60 group-hover:opacity-100"
                            >
                              <MoreHorizontal size={14} />
                            </span>
                          </button>
                          {resourceMenuId === set.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-2 top-10 z-20 min-w-[120px] rounded-xl border border-black/8 bg-white py-1 shadow-lg"
                            >
                              <button
                                onClick={() => handleDeleteResource(set.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ask anything — organic pill input */}
              <div className="shrink-0 px-4 pb-4">
                <label className="flex cursor-text items-center rounded-full border border-black/8 bg-cream-dark/20 pr-3 transition-all focus-within:border-black/14 focus-within:bg-white focus-within:shadow-sm">
                  <input
                    type="text"
                    value={homeQuery}
                    onChange={(e) => setHomeQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleHomeAsk()}
                    placeholder="Ask anything..."
                    className="w-full rounded-full bg-transparent px-5 py-3.5 font-app text-[13px] outline-none placeholder:text-ink-muted/50"
                  />
                  <button
                    onClick={handleHomeAsk}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      homeQuery.trim()
                        ? "bg-ink text-white hover:bg-ink/80"
                        : "text-ink-muted/40"
                    }`}
                  >
                    <ArrowRight size={13} />
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* ═══ CHAT TAB ═══ */}
          {activeTab?.type === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 font-app text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? "rounded-[20px] rounded-br-lg bg-ink text-white"
                            : "rounded-[20px] rounded-bl-lg bg-cream-dark/40 text-ink"
                        }`}
                      >
                        {msg.role === "ai" && msg.text === "" ? (
                          <div className="flex items-center gap-1 py-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted/40" style={{ animationDelay: "0ms" }} />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted/40" style={{ animationDelay: "150ms" }} />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted/40" style={{ animationDelay: "300ms" }} />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
              {/* Chat input — organic pill */}
              <div className="shrink-0 px-4 pb-4 pt-2">
                <label className="flex cursor-text items-center gap-2 rounded-full border border-black/8 bg-cream-dark/20 px-4 py-2.5 transition-all focus-within:border-black/14 focus-within:bg-white focus-within:shadow-sm">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !chatLoading && handleSendMessage()
                    }
                    placeholder="Ask about this document..."
                    disabled={chatLoading}
                    className="w-full bg-transparent font-app text-[13px] outline-none placeholder:text-ink-muted/50 disabled:opacity-60"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      chatInput.trim() && !chatLoading
                        ? "bg-ink text-white hover:bg-ink/80"
                        : "text-ink-muted/40"
                    }`}
                  >
                    <ArrowRight size={13} />
                  </button>
                </label>
              </div>
            </>
          )}

          {/* ═══ SUMMARY TAB ═══ */}
          {activeTab?.type === "summary" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <Sparkles size={14} className="text-ink-muted" />
                <span className="font-app text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  AI-Generated Summary
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-5">
                {/* Loading: checking DB */}
                {summaryLoading && !summaryGenerating && (
                  <div className="flex items-center gap-2 py-8">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-muted/30 border-t-ink-muted" />
                    <span className="font-app text-[13px] text-ink-muted">Loading summary...</span>
                  </div>
                )}

                {/* Error */}
                {summaryError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 mb-4">
                    <p className="font-app text-[13px] text-red-600">{summaryError}</p>
                    <button
                      onClick={generateSummary}
                      className="mt-2 font-app text-[12px] font-medium text-red-700 underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Streaming / rendered markdown */}
                {summaryContent !== null && summaryContent !== "" && (
                  <div className="prose-summary font-app text-[13px] leading-[1.8] text-ink/85">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summaryContent}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Generating indicator */}
                {summaryGenerating && (
                  <div className="flex items-center gap-2 py-3">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-ink-muted/30 border-t-ink-muted" />
                    <span className="font-app text-[11px] text-ink-muted">Generating...</span>
                  </div>
                )}

                {/* Regenerate button */}
                {summaryContent && !summaryGenerating && (
                  <button
                    onClick={generateSummary}
                    className="mt-6 flex items-center gap-2 rounded-full border border-black/8 px-4 py-2.5 font-app text-[12px] font-medium text-ink-light transition-colors hover:bg-cream-dark/50 hover:text-ink"
                  >
                    <RotateCcw size={13} />
                    Regenerate
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══ NOTES TAB ═══ */}
          {activeTab?.type === "notes" && (
            <div className="flex flex-1 flex-col px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-app text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Your Notes
                </span>
                <span className="font-app text-[11px] text-ink-muted/50">
                  Auto-saved
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start typing your notes about this document..."
                className="flex-1 resize-none rounded-2xl border border-black/6 bg-cream-dark/15 p-5 font-app text-[13px] leading-relaxed text-ink/85 outline-none transition-colors placeholder:text-ink-muted/40 focus:border-black/12 focus:bg-white"
              />
            </div>
          )}

          {/* ═══ LESSON PLAN TAB ═══ */}
          {activeTab?.type === "lesson" && (
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-app text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Guided Lesson
                </span>
                <span className="font-app text-[11px] text-ink-muted">
                  {doneCount}/{lessonSteps.length} complete
                </span>
              </div>
              <div className="mb-5 h-1.5 w-full rounded-full bg-cream-dark">
                <div
                  className="h-full rounded-full bg-ink transition-all"
                  style={{
                    width: `${(doneCount / lessonSteps.length) * 100}%`,
                  }}
                />
              </div>
              <div className="space-y-1">
                {lessonSteps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setLessonSteps((prev) =>
                        prev.map((s, j) =>
                          j === i ? { ...s, done: !s.done } : s
                        )
                      )
                    }
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-cream-dark/30 ${
                      step.done ? "opacity-60" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        step.done
                          ? "border-ink bg-ink text-white"
                          : "border-black/15"
                      }`}
                    >
                      {step.done && <Check size={11} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-app text-[13px] font-medium ${step.done ? "line-through" : ""}`}
                        >
                          {step.title}
                        </span>
                        <span className="font-app text-[11px] text-ink-muted">
                          {step.time}
                        </span>
                      </div>
                      <p className="mt-0.5 font-app text-[12px] text-ink-muted">
                        {step.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button className="mt-6 w-full rounded-full bg-ink px-4 py-2.5 font-app text-[13px] font-medium text-white transition-colors hover:bg-ink/80">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={14} />
                  {doneCount === 0
                    ? "Start Guided Lesson"
                    : doneCount < lessonSteps.length
                      ? "Continue Lesson"
                      : "Review Lesson"}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
