"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link, ClipboardPaste, Plus, Clock, ArrowRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  updated_at: string;
  document_count: number;
}

interface RecentDoc {
  id: string;
  title: string;
  type: string;
  subject_id: string;
  subject_name: string;
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

export default function AppDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recents, setRecents] = useState<RecentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
      const { data, error: err } = await supabase
        .from("subjects")
        .select("id, name, icon, description, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (err) {
        console.error("Subjects query failed:", { userId: user.id, code: err.code, message: err.message });

        // Auth error — try refreshing session once and retry
        if (err.code === "PGRST301" || err.message?.includes("JWT")) {
          console.log("Attempting session refresh...");
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Session refresh failed:", refreshError.message);
            return null;
          }
          const { data: retryData, error: retryError } = await supabase
            .from("subjects")
            .select("id, name, icon, description, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

          if (retryError) {
            console.error("Subjects retry failed:", retryError.code, retryError.message);
            return null;
          }
          return retryData;
        }
        return null;
      }
      return data;
    };

    const fetchData = async () => {
      try {
        const subjectsData = await fetchSubjects();
        console.log("Subjects loaded:", { userId: user.id, count: subjectsData?.length ?? 0 });

        if (subjectsData) {
          setSubjects(subjectsData.map((s) => ({ ...s, document_count: 0 })));
        } else {
          setError("Failed to load subjects");
        }

        // Fetch recent documents
        const { data: recentsData, error: recentsError } = await supabase
          .from("documents")
          .select("id, title, type, subject_id")
          .eq("user_id", user.id)
          .not("last_viewed_at", "is", null)
          .order("last_viewed_at", { ascending: false })
          .limit(5);

        if (recentsError) {
          console.error("Recents query failed:", { userId: user.id, code: recentsError.code, message: recentsError.message });
        } else if (recentsData) {
          setRecents(
            recentsData.map((d: any) => ({
              id: d.id,
              title: d.title,
              type: d.type,
              subject_id: d.subject_id,
              subject_name: "",
            }))
          );
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Something went wrong loading your data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateSubject = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: user.id, name: "Untitled Subject" })
      .select()
      .single();

    if (data && !error) {
      router.push(`/app/subject/${data.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pt-8 md:pt-16">
      {/* Hero */}
      <div className="text-center">
        <h1 className="font-app-heading text-[26px] tracking-tight md:text-[32px]">
          What do you want to learn?
        </h1>
        <p className="mt-2 text-sm text-ink-light">
          Start a new subject or pick up where you left off.
        </p>
      </div>

      {/* Search bar */}
      <div className="mt-8">
        <label className="flex cursor-text items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm transition-colors focus-within:border-black/20 focus-within:shadow-md">
          <Search size={20} className="shrink-0 text-ink-muted" />
          <input
            type="text"
            placeholder="I want to learn about Proximal Policy Optimization..."
            className="font-app w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
          />
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink/80">
            <ArrowRight size={16} />
          </button>
        </label>
      </div>

      {/* Upload options */}
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-muted">
        <span>or add content directly:</span>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-ink-light transition-colors hover:bg-white hover:text-ink">
          <Upload size={14} />
          Upload
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-ink-light transition-colors hover:bg-white hover:text-ink">
          <Link size={14} />
          Link
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-ink-light transition-colors hover:bg-white hover:text-ink">
          <ClipboardPaste size={14} />
          Paste
        </button>
      </div>

      {/* Subjects */}
      <div className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-app-heading">Your Subjects</h2>
          <button className="flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink">
            <Clock size={13} />
            Newest
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* New subject */}
          <button
            onClick={handleCreateSubject}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-transparent px-4 py-8 text-center transition-colors hover:border-black/20 hover:bg-white/50"
          >
            <Plus size={24} strokeWidth={1.5} className="mb-2 text-ink-muted" />
            <span className="text-sm font-medium text-ink-light">New Subject</span>
          </button>

          {/* Subject cards */}
          {subjects.map((subject) => (
            <a
              key={subject.id}
              href={`/app/subject/${subject.id}`}
              className="flex flex-col rounded-2xl border border-black/5 bg-white px-4 py-5 transition-all hover:shadow-md hover:border-black/8"
            >
              <span className="text-xl">{subject.icon}</span>
              <h3 className="mt-3 text-[13px] font-app-heading">
                {subject.name}
              </h3>
              <span className="mt-1 text-xs text-ink-muted">
                {subject.document_count} items
              </span>
              <span className="mt-auto pt-3 text-[11px] text-ink-muted/60">
                {timeAgo(subject.updated_at)}
              </span>
            </a>
          ))}

          {/* Loading skeleton */}
          {loading &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-black/5 bg-white px-4 py-5"
              >
                <div className="h-6 w-6 rounded bg-cream-dark" />
                <div className="mt-3 h-4 w-3/4 rounded bg-cream-dark" />
                <div className="mt-2 h-3 w-1/2 rounded bg-cream-dark" />
              </div>
            ))}

          {/* Error state */}
          {error && !loading && subjects.length === 0 && (
            <div className="col-span-full rounded-2xl border border-red-200/60 bg-red-50/50 px-4 py-6 text-center">
              <p className="text-sm text-red-600/80">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-red-500 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recents */}
      <div className="mt-14 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-app-heading">Recents</h2>
        </div>

        <div className="mt-4 space-y-1">
          {recents.length === 0 && !loading && (
            <p className="py-4 text-center text-sm text-ink-muted">
              No recent documents yet
            </p>
          )}
          {recents.map((item) => (
            <a
              key={item.id}
              href={`/app/subject/${item.subject_id}/doc/${item.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-dark/50 text-[10px] font-medium text-ink-muted">
                {item.type.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-ink-muted">{item.subject_name}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
