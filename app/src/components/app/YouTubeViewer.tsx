"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TranscriptSegment {
  text: string;
  offset: number; // ms
  duration: number; // ms
}

interface YouTubeViewerProps {
  videoId: string;
  transcript: TranscriptSegment[] | null;
  onTranscriptClick?: (offsetMs: number) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Group segments into ~30s chunks
function groupSegments(segments: TranscriptSegment[], intervalMs = 30000): TranscriptSegment[] {
  if (!segments.length) return [];
  const groups: TranscriptSegment[] = [];
  let current = { text: segments[0].text, offset: segments[0].offset, duration: 0 };

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.offset - current.offset < intervalMs) {
      current.text += " " + seg.text;
    } else {
      current.duration = seg.offset - current.offset;
      groups.push({ ...current });
      current = { text: seg.text, offset: seg.offset, duration: 0 };
    }
  }
  current.duration = (segments[segments.length - 1].offset + segments[segments.length - 1].duration) - current.offset;
  groups.push(current);
  return groups;
}

export default function YouTubeViewer({ videoId, transcript }: YouTubeViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0); // ms
  const [autoScroll, setAutoScroll] = useState(true);
  const playerReadyRef = useRef(false);

  // Poll current time from YouTube iframe API
  useEffect(() => {
    const interval = setInterval(() => {
      if (!iframeRef.current?.contentWindow) return;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "getCurrentTime", args: [] }),
        "*"
      );
    }, 1000);

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data.event === "infoDelivery" && data.info?.currentTime !== undefined) {
          setCurrentTime(data.info.currentTime * 1000);
        }
        if (data.event === "onReady") {
          playerReadyRef.current = true;
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (!autoScroll || !transcript || !transcriptRef.current) return;
    const grouped = groupSegments(transcript);
    const activeIdx = grouped.findIndex(
      (seg, i) =>
        currentTime >= seg.offset &&
        (i === grouped.length - 1 || currentTime < grouped[i + 1].offset)
    );
    if (activeIdx >= 0) {
      const el = transcriptRef.current.children[activeIdx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentTime, autoScroll, transcript]);

  const seekTo = useCallback((offsetMs: number) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "seekTo", args: [offsetMs / 1000, true] }),
      "*"
    );
    setCurrentTime(offsetMs);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Video Player */}
      <div className="shrink-0 overflow-hidden rounded-xl mx-3 mt-3 bg-black">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Transcript Section */}
      {transcript && transcript.length > 0 && (
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Transcript Content */}
          <div ref={transcriptRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {groupSegments(transcript).map((seg, i, arr) => {
              const isActive =
                currentTime >= seg.offset &&
                (i === arr.length - 1 || currentTime < arr[i + 1].offset);

              return (
                <div
                  key={i}
                  className={`group cursor-pointer rounded-lg px-3 py-2 -mx-3 transition-colors ${
                    isActive ? "bg-cream-dark/50" : "hover:bg-cream-dark/30"
                  }`}
                  onClick={() => seekTo(seg.offset)}
                >
                  <span className="inline-block rounded bg-cream-dark/60 px-1.5 py-0.5 font-app text-[11px] font-medium text-ink-muted mb-1">
                    {formatTime(seg.offset)}
                  </span>
                  <p className={`font-app text-[14px] leading-relaxed ${isActive ? "text-ink" : "text-ink/75"}`}>
                    {seg.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No transcript fallback */}
      {(!transcript || transcript.length === 0) && (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-app text-[13px] text-ink-muted">Transcript not available for this video</p>
        </div>
      )}
    </div>
  );
}
