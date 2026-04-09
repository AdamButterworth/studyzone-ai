"use client";

import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useProcessing } from "@/lib/ProcessingContext";

export default function ProcessingToast() {
  const { jobs, dismissJob } = useProcessing();

  if (jobs.length === 0) return null;

  return (
    <div className="fixed right-4 top-16 z-50 flex flex-col gap-2 w-80">
      {jobs.map((job) => (
        <div
          key={job.documentId}
          className="flex items-center gap-3 rounded-xl border border-black/8 bg-white px-4 py-3 shadow-lg animate-in slide-in-from-right"
        >
          {job.status === "processing" && (
            <Loader2 size={16} className="shrink-0 animate-spin text-ink-muted" />
          )}
          {job.status === "indexed" && (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
          )}
          {job.status === "error" && (
            <AlertCircle size={16} className="shrink-0 text-red-500" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-app text-[13px] font-medium text-ink">
              {job.title}
            </p>
            <p className="font-app text-[11px] text-ink-muted">
              {job.status === "processing" && "Processing..."}
              {job.status === "indexed" && "Ready for AI"}
              {job.status === "error" && "Processing failed"}
            </p>
          </div>

          <button
            onClick={() => dismissJob(job.documentId)}
            className="shrink-0 rounded-md p-1 text-ink-muted/50 transition-colors hover:bg-cream-dark/50 hover:text-ink"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
