"use client";

import { Search, PanelLeft } from "lucide-react";

interface AppTopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function AppTopBar({ sidebarOpen, onToggleSidebar }: AppTopBarProps) {
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

      {/* Search bar */}
      <div className="flex flex-1 justify-center">
        <label className="flex w-full max-w-lg cursor-text items-center gap-2 rounded-xl border border-black/5 bg-white/60 px-4 py-2 transition-colors focus-within:border-black/10 focus-within:bg-white">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            type="text"
            placeholder="Search or learn anything..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
          />
        </label>
      </div>
    </header>
  );
}
