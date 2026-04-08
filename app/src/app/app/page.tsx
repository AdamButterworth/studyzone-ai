"use client";

import { Upload, Link, ClipboardPaste, Plus, Clock, ArrowRight, Search } from "lucide-react";

const subjects = [
  { name: "Reinforcement Learning", icon: "🧠", count: 3, updated: "2 hours ago" },
  { name: "Organic Chemistry", icon: "🧪", count: 5, updated: "1 day ago" },
  { name: "Constitutional Law", icon: "⚖️", count: 2, updated: "3 days ago" },
];

const recents = [
  { name: "Policy Gradient Methods", subject: "Reinforcement Learning", type: "PDF" },
  { name: "Post-Training Methods", subject: "Reinforcement Learning", type: "PDF" },
  { name: "Amino Acids Overview", subject: "Organic Chemistry", type: "DOCX" },
  { name: "Bellman Equations", subject: "Reinforcement Learning", type: "TXT" },
];

export default function AppDashboard() {
  return (
    <div className="mx-auto max-w-3xl pt-8 md:pt-16">
      {/* Hero — what do you want to learn */}
      <div className="text-center">
        <h1 className="text-3xl tracking-tight md:text-4xl">
          What do you want to learn?
        </h1>
        <p className="mt-2 text-ink-light">
          Start a new subject or pick up where you left off.
        </p>
      </div>

      {/* Search / topic bar */}
      <div className="mt-8">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm transition-colors focus-within:border-black/20 focus-within:shadow-md">
          <Search size={20} className="shrink-0 text-ink-muted" />
          <input
            type="text"
            placeholder="I want to learn about Proximal Policy Optimization..."
            className="w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
          />
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink/80">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Upload options — secondary */}
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
          <h2 className="text-xl font-semibold font-[family-name:var(--font-dm-sans)]">
            Your Subjects
          </h2>
          <button className="flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink">
            <Clock size={13} />
            Newest
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* New subject card */}
          <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-transparent px-4 py-8 text-center transition-colors hover:border-black/20 hover:bg-white/50">
            <Plus size={24} strokeWidth={1.5} className="mb-2 text-ink-muted" />
            <span className="text-sm font-medium text-ink-light">New Subject</span>
          </button>

          {/* Subject cards */}
          {subjects.map((subject) => (
            <a
              key={subject.name}
              href="#"
              className="group flex flex-col rounded-2xl border border-black/5 bg-white px-4 py-5 transition-all hover:border-black/10 hover:shadow-sm"
            >
              <span className="text-xl">{subject.icon}</span>
              <h3 className="mt-3 text-sm font-semibold font-[family-name:var(--font-dm-sans)] group-hover:underline">
                {subject.name}
              </h3>
              <span className="mt-1 text-xs text-ink-muted">
                {subject.count} items
              </span>
              <span className="mt-auto pt-3 text-[11px] text-ink-muted/60">
                {subject.updated}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recents */}
      <div className="mt-14 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-dm-sans)]">
            Recents
          </h2>
          <button className="text-sm text-ink-muted transition-colors hover:text-ink">
            View all →
          </button>
        </div>

        <div className="mt-4 space-y-1">
          {recents.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-dark/50 text-[10px] font-medium text-ink-muted">
                {item.type}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-ink-muted">{item.subject}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
