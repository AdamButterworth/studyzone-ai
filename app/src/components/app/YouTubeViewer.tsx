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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { YT: any; onYouTubeIframeAPIReady: (() => void) | undefined; } }

export default function YouTubeViewer({ videoId, transcript }: YouTubeViewerProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0); // ms
  const [autoScroll, setAutoScroll] = useState(true);

  // Load YouTube IFrame API and create player
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const createPlayer = () => {
      if (!playerContainerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => {
            // Poll current time
            interval = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime() * 1000);
              }
            }, 500);
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      // Load the API script
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      clearInterval(interval);
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  // Pause auto-scroll on any user interaction with the transcript
  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;
  const programmaticScrollRef = useRef(false);
  const lastAutoScrolledIdxRef = useRef<number | null>(null);
  const disableAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      programmaticScrollRef.current = false;
      setAutoScroll(false);
    }
  }, []);

  useEffect(() => {
    if (!autoScroll) {
      lastAutoScrolledIdxRef.current = null;
    }
  }, [autoScroll]);

  useEffect(() => {
    const container = transcriptRef.current;
    if (!container) return;
    const handleUserScroll = () => {
      if (programmaticScrollRef.current) return; // ignore our own scrolls
      disableAutoScroll();
    };
    const handleUserIntent = () => {
      disableAutoScroll();
    };

    container.addEventListener("scroll", handleUserScroll);
    container.addEventListener("wheel", handleUserIntent, { passive: true });
    container.addEventListener("touchmove", handleUserIntent, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleUserScroll);
      container.removeEventListener("wheel", handleUserIntent);
      container.removeEventListener("touchmove", handleUserIntent);
    };
  }, [disableAutoScroll]);

  // Auto-scroll transcript
  useEffect(() => {
    if (!autoScroll || !transcript || !transcriptRef.current) return;
    const grouped = groupSegments(transcript);
    const activeIdx = grouped.findIndex(
      (seg, i) =>
        currentTime >= seg.offset &&
        (i === grouped.length - 1 || currentTime < grouped[i + 1].offset)
    );
    if (activeIdx >= 0 && activeIdx !== lastAutoScrolledIdxRef.current) {
      const el = transcriptRef.current.children[activeIdx] as HTMLElement;
      if (el) {
        programmaticScrollRef.current = true;
        lastAutoScrolledIdxRef.current = activeIdx;
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        // Reset flag after scroll completes
        const timer = window.setTimeout(() => {
          programmaticScrollRef.current = false;
        }, 500);
        return () => window.clearTimeout(timer);
      }
    }
  }, [currentTime, autoScroll, transcript]);

  const seekTo = useCallback((offsetMs: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(offsetMs / 1000, true);
      setCurrentTime(offsetMs);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Video Player */}
      <div className="shrink-0 overflow-hidden rounded-xl mx-3 mt-3 bg-black">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div ref={playerContainerRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Transcript Section */}
      {transcript && transcript.length > 0 && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Transcript header */}
          <div className="flex shrink-0 items-center justify-between px-5 pt-3 pb-1">
            <span className="font-app text-[12px] font-medium uppercase tracking-wider text-ink-muted">Transcript</span>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-app text-[11px] font-medium transition-colors ${
                autoScroll
                  ? "bg-black/[0.05] text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
              </svg>
              Auto Scroll
            </button>
          </div>

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
                    isActive ? "bg-black/[0.07]" : "hover:bg-black/[0.03]"
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
