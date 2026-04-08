"use client";

import { useState } from "react";
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
} from "lucide-react";

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const recentDocs = [
  { name: "Policy Gradient Methods", path: "Reinforcement Learning" },
  { name: "Bellman Equations", path: "Reinforcement Learning" },
  { name: "Amino Acids Overview", path: "Organic Chemistry" },
];

const subjects = [
  { name: "Reinforcement Learning", icon: "🧠", count: 3 },
  { name: "Organic Chemistry", icon: "🧪", count: 5 },
  { name: "Constitutional Law", icon: "⚖️", count: 2 },
];

export default function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [subjectsOpen, setSubjectsOpen] = useState(true);

  return (
    <aside className="font-app-sidebar relative flex h-full w-[280px] flex-col border-r border-black/5 bg-white">
      <div className="flex w-[280px] flex-col h-full">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <a href="/app" className="flex items-center gap-2">
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
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-ink/85 transition-colors hover:bg-cream-dark/50">
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
          {/* Recents — collapsible */}
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
            {recentsOpen &&
              recentDocs.map((doc) => (
                <a
                  key={doc.name}
                  href="#"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-ink/85 transition-colors hover:bg-cream-dark/50"
                >
                  <div className="h-1 w-1 shrink-0 rounded-full bg-ink-muted/40" />
                  <span className="truncate">{doc.name}</span>
                </a>
              ))}
          </div>

          {/* Subjects — collapsible */}
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
                    // Create new subject
                  }}
                />
                <ChevronDown
                  size={12}
                  className={`text-ink-muted transition-transform ${subjectsOpen ? "" : "-rotate-90"}`}
                />
              </div>
            </button>
            {subjectsOpen &&
              subjects.map((subject) => (
                <a
                  key={subject.name}
                  href="#"
                  className="group flex items-center justify-between rounded-lg px-3 py-1.5 text-ink/85 transition-colors hover:bg-cream-dark/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs">{subject.icon}</span>
                    <span className="truncate">{subject.name}</span>
                  </div>
                  <span className="text-[11px] text-ink-muted/50 group-hover:hidden">
                    {subject.count}
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
          <div className="mt-2 flex items-center gap-2.5 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#5B8DEF] text-xs font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Adam B.</p>
              <p className="text-[11px] text-ink-muted">Free Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
