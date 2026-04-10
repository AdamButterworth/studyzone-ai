"use client";

import { LoaderCircle } from "lucide-react";

const PAGE_SHADOW =
  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)";

interface PdfLoadingShellProps {
  visibleWidth?: number;
}

export default function PdfLoadingShell({
  visibleWidth,
}: PdfLoadingShellProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-lg bg-white"
        style={{
          width: visibleWidth || undefined,
          maxWidth: visibleWidth ? undefined : 760,
          aspectRatio: "1 / 1.414",
          boxShadow: PAGE_SHADOW,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-ink-muted/70">
            <LoaderCircle size={24} className="animate-spin" />
            <span className="font-app text-[12px]">Loading document...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
