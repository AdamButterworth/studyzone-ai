"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MessageSquare,
  FileText,
  ListChecks,
  StickyNote,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Download,
  MoreHorizontal,
  Plus,
  ChevronDown,
  GripVertical,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Search,
  Maximize2,
  Minimize2,
} from "lucide-react";
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

/* ─── Mock tab data ─── */

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    text: "Can you explain the REINFORCE algorithm in simple terms?",
  },
  {
    id: "2",
    role: "ai",
    text: "Think of REINFORCE like trial-and-error learning:\n\n1. Your agent tries a full episode using its current strategy\n2. After the episode, it looks at which actions led to good outcomes (high returns)\n3. It makes those good actions more likely in the future\n\nThe key formula is: increase the probability of action a in state s proportional to how good the total return was after taking that action.\n\nThe downside? Since it uses the full episode return, the learning signal is noisy \u2014 a single lucky reward at the end makes all actions in that episode look good. This is the \"high variance\" problem that baselines help solve.",
  },
  {
    id: "3",
    role: "user",
    text: "Why does subtracting a baseline reduce variance but not bias?",
  },
  {
    id: "4",
    role: "ai",
    text: 'Mathematically, the baseline b(s) doesn\'t depend on the action a, so:\n\nE[\u2207\u03B8 log \u03C0(a|s) \u00B7 b(s)] = 0\n\nThis means subtracting b(s) doesn\'t change the expected gradient (no bias), but it centers the returns around zero, which dramatically reduces their spread (lower variance).\n\nIntuition: without a baseline, an action that gets return +50 looks "good." But if the average return from that state is +100, it\'s actually below average! The baseline V(s) \u2248 100 corrects this, giving an advantage of -50, correctly telling the policy to avoid that action.',
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

const MOCK_SETS: SavedSet[] = [
  {
    id: "s1",
    type: "summary",
    title: "Policy Gradient Methods: Key Concepts",
    detail: "Detailed Summary \u00B7 All topics",
  },
  {
    id: "s2",
    type: "notes",
    title: "Untitled note",
    detail: "4/7/2026",
  },
  {
    id: "s3",
    type: "chat",
    title: "REINFORCE explained simply",
    detail: "4/7/2026",
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

      if (docResult.data?.file_path && docResult.data.status === "ready") {
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
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newW = rect.right - e.clientX;
      setRightWidth(Math.max(340, Math.min(rect.width * 0.55, newW)));
    };
    const onUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

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
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [lessonSteps, setLessonSteps] = useState(MOCK_LESSON);
  const [notes, setNotes] = useState("");
  const [homeQuery, setHomeQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollToPage, setScrollToPage] = useState<number | undefined>();
  const [zoom, setZoom] = useState(1);
  const [pdfBaseWidth, setPdfBaseWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.15;

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
        setPdfBaseWidth(entry.target.clientWidth - 32);
      }
    });
    observer.observe(pdfScrollRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: chatInput.trim() },
    ]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I\u2019m analyzing the relevant sections of the document. In a full implementation, I\u2019d give you a detailed answer grounded in the material.",
        },
      ]);
    }, 1200);
  };

  const handleHomeAsk = () => {
    if (!homeQuery.trim()) return;
    // Open a new chat tab with the question
    const newTab: Tab = { id: Date.now().toString(), type: "chat", label: "Chat" };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: homeQuery.trim() },
    ]);
    setHomeQuery("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "Great question! Let me look through the document to help you with that.",
        },
      ]);
    }, 1200);
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
            <span className="font-app text-[12px] tabular-nums text-ink-light">
              {totalPages > 0 ? `${currentPage} / ${totalPages}` : "—"}
            </span>
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
              pageWidth={pdfBaseWidth > 0 ? pdfBaseWidth * zoom : undefined}
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
        style={{ width: isFullscreen ? 0 : rightWidth }}
        className={`flex shrink-0 flex-col overflow-hidden bg-white transition-[width] duration-300 ${isFullscreen ? "w-0" : ""}`}
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
                  <div className="space-y-0.5">
                    {MOCK_SETS.map((set) => {
                      const opt = TAB_OPTIONS.find(
                        (o) => o.type === set.type
                      );
                      const Icon = opt?.icon || FileText;
                      return (
                        <button
                          key={set.id}
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
                          <MoreHorizontal
                            size={14}
                            className="shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </button>
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
                        <p className="whitespace-pre-wrap">{msg.text}</p>
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
                      e.key === "Enter" && handleSendMessage()
                    }
                    placeholder="Ask about this document..."
                    className="w-full bg-transparent font-app text-[13px] outline-none placeholder:text-ink-muted/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      chatInput.trim()
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
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-ink-muted" />
                <span className="font-app text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  AI-Generated Summary
                </span>
              </div>
              <div className="font-app text-[13px] leading-[1.8] text-ink/85">
                <h3 className="mb-2 font-app-heading text-[14px]">
                  Key Concepts
                </h3>
                <p className="mb-2 pl-3">
                  <span className="font-semibold">
                    Policy gradient methods
                  </span>{" "}
                  optimize the policy directly via gradient ascent on expected
                  return, unlike value-based methods.
                </p>
                <p className="mb-2 pl-3">
                  <span className="font-semibold">
                    The Policy Gradient Theorem
                  </span>{" "}
                  provides a tractable gradient using the score function,
                  avoiding differentiation through dynamics.
                </p>
                <p className="mb-2 pl-3">
                  <span className="font-semibold">REINFORCE</span> is the
                  simplest algorithm: sample episodes, weight actions by
                  returns. Simple but high variance.
                </p>
                <p className="mb-2 pl-3">
                  <span className="font-semibold">Baselines</span> (typically
                  V(s)) reduce variance without bias. This leads to the
                  advantage function.
                </p>
                <p className="mb-2 pl-3">
                  <span className="font-semibold">Actor-Critic</span> methods
                  learn both policy and value function simultaneously, giving
                  lower-variance gradient estimates.
                </p>

                <h3 className="mb-2 mt-5 font-app-heading text-[14px]">
                  Main Takeaways
                </h3>
                <p className="mb-1.5 pl-3">
                  1. Policy gradients excel in continuous action spaces
                </p>
                <p className="mb-1.5 pl-3">
                  2. Variance reduction is the central challenge
                </p>
                <p className="mb-1.5 pl-3">
                  3. PPO is the most widely used variant
                </p>
                <p className="mb-1.5 pl-3">
                  4. These methods underpin RLHF for modern AI alignment
                </p>
              </div>
              <button className="mt-6 flex items-center gap-2 rounded-full border border-black/8 px-4 py-2.5 font-app text-[12px] font-medium text-ink-light transition-colors hover:bg-cream-dark/50 hover:text-ink">
                <RotateCcw size={13} />
                Regenerate
              </button>
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
