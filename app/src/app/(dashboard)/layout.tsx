"use client";

import { useState } from "react";
import AppSidebar from "@/components/app/AppSidebar";
import AppTopBar from "@/components/app/AppTopBar";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { TopBarProvider } from "@/lib/TopBarContext";
import { ProcessingProvider } from "@/lib/ProcessingContext";
import ProcessingToast from "@/components/app/ProcessingToast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
    <TopBarProvider>
    <ProcessingProvider>
    <div className="flex h-screen overflow-hidden bg-[#FAF7F4]">
      <ProcessingToast />
      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* Mobile: fixed drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar open onToggle={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop: inline, animated width */}
      <div
        className={`hidden md:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? "w-[280px]" : "w-0"
        }`}
      >
        <AppSidebar open onToggle={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${sidebarOpen ? "" : "ml-2"}`}>
        <AppTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto rounded-tl-2xl bg-white shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="px-5 py-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ProcessingProvider>
    </TopBarProvider>
    </AuthProvider>
  );
}
