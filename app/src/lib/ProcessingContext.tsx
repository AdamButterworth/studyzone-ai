"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProcessingJob {
  documentId: string;
  title: string;
  status: "processing" | "indexed" | "error";
}

interface ProcessingContextType {
  jobs: ProcessingJob[];
  addJob: (documentId: string, title: string) => void;
  dismissJob: (documentId: string) => void;
}

const ProcessingContext = createContext<ProcessingContextType>({
  jobs: [],
  addJob: () => {},
  dismissJob: () => {},
});

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const supabase = createClient();
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const addJob = (documentId: string, title: string) => {
    setJobs((prev) => {
      if (prev.some((j) => j.documentId === documentId)) return prev;
      return [...prev, { documentId, title, status: "processing" }];
    });
  };

  const dismissJob = (documentId: string) => {
    setJobs((prev) => prev.filter((j) => j.documentId !== documentId));
  };

  // Poll for status changes
  useEffect(() => {
    const processingJobs = jobs.filter((j) => j.status === "processing");
    if (processingJobs.length === 0) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const poll = async () => {
      const ids = processingJobs.map((j) => j.documentId);
      const { data } = await supabase
        .from("documents")
        .select("id, status")
        .in("id", ids);

      if (data) {
        setJobs((prev) =>
          prev.map((job) => {
            const updated = data.find((d: { id: string }) => d.id === job.documentId);
            if (updated && updated.status !== job.status) {
              if (updated.status === "indexed" || updated.status === "error") {
                return { ...job, status: updated.status };
              }
            }
            return job;
          })
        );
      }
    };

    poll(); // immediate check
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobs.filter((j) => j.status === "processing").length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss completed jobs after 5 seconds
  useEffect(() => {
    const doneJobs = jobs.filter((j) => j.status === "indexed");
    if (doneJobs.length === 0) return;

    const timers = doneJobs.map((job) =>
      setTimeout(() => dismissJob(job.documentId), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [jobs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProcessingContext.Provider value={{ jobs, addJob, dismissJob }}>
      {children}
    </ProcessingContext.Provider>
  );
}

export function useProcessing() {
  return useContext(ProcessingContext);
}
