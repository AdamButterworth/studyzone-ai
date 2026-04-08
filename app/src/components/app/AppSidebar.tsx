"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Settings,
  HelpCircle,
  ChevronsLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface SidebarSubject {
  id: string;
  name: string;
  icon: string;
  document_count: number;
}

interface RecentDoc {
  id: string;
  title: string;
  subject_id: string;
}

export default function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [subjectsOpen, setSubjectsOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState<SidebarSubject[]>([]);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const fetchedFor = useRef<string | null>(null);
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  // Fetch subjects and recents
  useEffect(() => {
    if (authLoading || !user) return;
    if (fetchedFor.current === user.id) return;
    fetchedFor.current = user.id;

    console.log("Sidebar fetch starting:", { userId: user.id, authLoading });

    const fetchSidebar = async () => {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, icon")
        .eq("user_id", user.id)
        .order("position")
        .order("created_at", { ascending: false });

      if (subjectsError) {
        console.error("Sidebar subjects error:", { userId: user.id, code: subjectsError.code, message: subjectsError.message });
      } else if (subjectsData) {
        console.log("Sidebar subjects loaded:", { userId: user.id, count: subjectsData.length });
        const withCounts = await Promise.all(
          subjectsData.map(async (s) => {
            const { count } = await supabase
              .from("documents")
              .select("*", { count: "exact", head: true })
              .eq("subject_id", s.id);
            return { ...s, document_count: count || 0 };
          })
        );
        setSubjects(withCounts);
      }

      const { data: recentsData, error: recentsError } = await supabase
        .from("documents")
        .select("id, title, subject_id")
        .eq("user_id", user.id)
        .not("last_viewed_at", "is", null)
        .order("last_viewed_at", { ascending: false })
        .limit(4);

      if (recentsError) {
        console.error("Sidebar recents error:", { userId: user.id, code: recentsError.code, message: recentsError.message });
      } else if (recentsData) {
        setRecentDocs(recentsData);
      }
    };

    fetchSidebar();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  const handleCreateSubject = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: user.id, name: "Untitled Subject" })
      .select()
      .single();

    if (data && !error) {
      router.push(`/subject/${data.id}`);
    }
  };

  return (
    <aside className="font-app-sidebar relative flex h-full w-[280px] flex-col border-r border-black/5 bg-white">
      <div className="flex w-[280px] flex-col h-full">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="StudyZone AI" className="h-6 w-6" />
            <span className="text-sm font-semibold tracking-tight font-app-heading">
              StudyZone AI
            </span>
          </a>
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cream-dark/50 hover:text-ink"
          >
            <ChevronsLeft size={16} />
          </button>
        </div>

        {/* New subject button */}
        <div className="px-3 pb-2">
          <button
            onClick={handleCreateSubject}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-ink/85 transition-colors hover:bg-cream-dark/50"
          >
            <Plus size={15} />
            New Subject
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-ink-muted transition-colors hover:bg-cream-dark/50">
            <Search size={14} />
            Search
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3">
          {/* Recents */}
          <div className="mb-2">
            <button
              onClick={() => setRecentsOpen(!recentsOpen)}
              className="mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-1.5 transition-colors hover:bg-cream-dark/50"
            >
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-ink-muted" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Recents
                </span>
              </div>
              <ChevronDown
                size={12}
                className={`text-ink-muted transition-transform ${recentsOpen ? "" : "-rotate-90"}`}
              />
            </button>
            {recentsOpen && recentDocs.length === 0 && (
              <p className="px-3 py-1.5 text-[12px] text-ink-muted/50">
                No recent documents
              </p>
            )}
            {recentsOpen &&
              recentDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={`/subject/${doc.subject_id}/doc/${doc.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-ink/85 transition-colors hover:bg-cream-dark/50"
                >
                  <div className="h-1 w-1 shrink-0 rounded-full bg-ink-muted/40" />
                  <span className="truncate">{doc.title}</span>
                </a>
              ))}
          </div>

          {/* Subjects */}
          <div className="mb-2">
            <button
              onClick={() => setSubjectsOpen(!subjectsOpen)}
              className="mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-1.5 transition-colors hover:bg-cream-dark/50"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-ink-muted" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Subjects
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Plus
                  size={12}
                  className="text-ink-muted transition-colors hover:text-ink"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateSubject();
                  }}
                />
                <ChevronDown
                  size={12}
                  className={`text-ink-muted transition-transform ${subjectsOpen ? "" : "-rotate-90"}`}
                />
              </div>
            </button>
            {subjectsOpen && subjects.length === 0 && (
              <p className="px-3 py-1.5 text-[12px] text-ink-muted/50">
                No subjects yet
              </p>
            )}
            {subjectsOpen &&
              subjects.map((subject) => (
                <a
                  key={subject.id}
                  href={`/subject/${subject.id}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-1.5 text-ink/85 transition-colors hover:bg-cream-dark/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs">{subject.icon}</span>
                    <span className="truncate">{subject.name}</span>
                  </div>
                  <span className="text-[11px] text-ink-muted/50 group-hover:hidden">
                    {subject.document_count}
                  </span>
                  <ChevronRight
                    size={14}
                    className="hidden shrink-0 text-ink-muted/40 group-hover:block"
                  />
                </a>
              ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-black/5 px-3 py-3">
          <a
            href="/help"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-ink-muted transition-colors hover:bg-cream-dark/50 hover:text-ink/85"
          >
            <HelpCircle size={14} />
            Help & Feedback
          </a>
          <a
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-ink-muted transition-colors hover:bg-cream-dark/50 hover:text-ink/85"
          >
            <Settings size={14} />
            Settings
          </a>

          {/* User profile */}
          <div className="relative mt-2" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-cream-dark/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5B8DEF] text-xs font-bold text-white">
                {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">
                  {profile
                    ? `${profile.first_name} ${profile.last_name?.[0] || ""}.`
                    : user?.email ?? "Account"}
                </p>
                <p className="text-[11px] text-ink-muted">Free Plan</p>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl border border-black/8 bg-white p-1 shadow-xl">
                <button
                  onClick={() => { setUserMenuOpen(false); signOut(); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-light transition-colors hover:bg-cream-dark/50 hover:text-ink"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
