"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import PdfLoadingShell from "@/components/app/PdfLoadingShell";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/* ─── Shared shadow style ─── */
const PAGE_SHADOW =
  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)";

/* ─── PageSkeleton ─── */
function PageSkeleton({ width }: { width?: number }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-white"
      style={{
        width: width || "100%",
        aspectRatio: "1 / 1.414",
        boxShadow: PAGE_SHADOW,
      }}
    />
  );
}

/* ─── PageError ─── */
function PageError({ width }: { width?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-white"
      style={{
        width: width || "100%",
        aspectRatio: "1 / 1.414",
        boxShadow: PAGE_SHADOW,
      }}
    >
      <p className="font-app text-[13px] text-ink-muted">
        Failed to render page
      </p>
    </div>
  );
}

interface BufferedPdfPageProps {
  pageNumber: number;
  pageWidth?: number;
  pageRef?: (el: HTMLDivElement | null) => void;
  onRendered?: () => void;
}

function BufferedPdfPage({
  pageNumber,
  pageWidth,
  pageRef,
  onRendered,
}: BufferedPdfPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previousWidthRef = useRef<number | undefined>(pageWidth);
  const [snapshotSrc, setSnapshotSrc] = useState<string | null>(null);
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);

  useLayoutEffect(() => {
    const previousWidth = previousWidthRef.current;

    if (
      typeof previousWidth === "number" &&
      typeof pageWidth === "number" &&
      Math.abs(previousWidth - pageWidth) > 0.5
    ) {
      const canvas = wrapperRef.current?.querySelector("canvas");

      if (canvas instanceof HTMLCanvasElement && canvas.width > 0) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSnapshotSrc(canvas.toDataURL("image/png"));
        } catch {
          setSnapshotSrc(null);
        }
      }
    }

    previousWidthRef.current = pageWidth;
  }, [pageWidth]);

  const handleRenderSuccess = useCallback(() => {
    setHasRenderedOnce(true);
    setSnapshotSrc(null);
    onRendered?.();
  }, [onRendered]);

  const clearSnapshot = useCallback(() => {
    setSnapshotSrc(null);
  }, []);

  const showLoadingSkeleton = !hasRenderedOnce && !snapshotSrc;

  return (
    <div
      ref={(el) => {
        wrapperRef.current = el;
        pageRef?.(el);
      }}
      data-page={pageNumber}
      className="relative overflow-hidden rounded-lg bg-white"
      style={{ boxShadow: PAGE_SHADOW }}
    >
      {snapshotSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={snapshotSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
        />
      )}
      <Page
        pageNumber={pageNumber}
        width={pageWidth || undefined}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        onRenderSuccess={handleRenderSuccess}
        onRenderError={clearSnapshot}
        loading={showLoadingSkeleton ? <PageSkeleton width={pageWidth} /> : null}
        error={<PageError width={pageWidth} />}
      />
    </div>
  );
}

/* ─── Props ─── */
interface PdfViewerProps {
  url: string;
  onPageChange?: (page: number, total: number) => void;
  currentPage?: number;
  pageWidth?: number;
  displayScale?: number;
  renderAllPages?: boolean;
  initialRenderCount?: number;
  renderBatchSize?: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  loadingVisibleWidth?: number;
  onFirstPageRender?: () => void;
}

export default function PdfViewer({
  url,
  onPageChange,
  currentPage: controlledPage,
  pageWidth,
  displayScale = 1,
  renderAllPages = false,
  initialRenderCount = 3,
  renderBatchSize = 4,
  scrollContainerRef,
  loadingVisibleWidth,
  onFirstPageRender,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [visiblePages, setVisiblePages] = useState(0);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollingToPage = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const didReportFirstPageRenderRef = useRef(false);

  useEffect(() => {
    didReportFirstPageRenderRef.current = false;
  }, [url]);

  /* ── Document loaded ── */
  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      setVisiblePages(
        renderAllPages ? total : Math.min(initialRenderCount, total)
      );
      onPageChange?.(1, total);
    },
    [onPageChange, renderAllPages, initialRenderCount]
  );

  /* ── When renderAllPages flips to true (search opened), show all ── */
  useEffect(() => {
    if (renderAllPages && numPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisiblePages(numPages);
    }
  }, [renderAllPages, numPages]);

  /* ── Bottom sentinel — load more pages as user scrolls ── */
  useEffect(() => {
    if (renderAllPages || numPages === 0) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root = scrollContainerRef?.current || null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisiblePages((prev) => Math.min(prev + renderBatchSize, numPages));
        }
      },
      { root, rootMargin: "800px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [numPages, visiblePages, renderAllPages, renderBatchSize, scrollContainerRef]);

  /* ── Track which page is visible (current-page indicator) ── */
  useEffect(() => {
    if (numPages === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToPage.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const pageNum = Number(entry.target.getAttribute("data-page"));
            if (pageNum) onPageChange?.(pageNum, numPages);
          }
        }
      },
      { threshold: 0.5 }
    );

    for (const [, el] of pageRefs.current) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [numPages, visiblePages, onPageChange]);

  /* ── Jump-to-page: ensure the target page is rendered first ── */
  useEffect(() => {
    if (!controlledPage) return;

    // Expand visible range if needed
    if (controlledPage > visiblePages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisiblePages(Math.min(controlledPage + renderBatchSize, numPages));
    }

    // Wait a tick for the DOM to mount, then scroll
    const raf = requestAnimationFrame(() => {
      const el = pageRefs.current.get(controlledPage);
      if (!el) return;
      scrollingToPage.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const timer = setTimeout(() => {
        scrollingToPage.current = false;
      }, 600);
      // cleanup handled by next effect run
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [controlledPage, visiblePages, numPages, renderBatchSize]);

  const setPageRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) pageRefs.current.set(pageNum, el);
      else pageRefs.current.delete(pageNum);
    },
    []
  );

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateSize = () => {
      setContentSize({
        width: content.offsetWidth,
        height: content.offsetHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const liveScale =
    Number.isFinite(displayScale) && displayScale > 0 ? displayScale : 1;
  const effectiveLoadingWidth =
    typeof loadingVisibleWidth === "number" && loadingVisibleWidth > 0
      ? loadingVisibleWidth
      : typeof pageWidth === "number" && pageWidth > 0
        ? pageWidth * liveScale
        : undefined;
  const renderCatchupScale =
    typeof pageWidth === "number" &&
    pageWidth > 0 &&
    contentSize.width > 0
      ? pageWidth / contentSize.width
      : 1;
  const effectiveScale = liveScale * renderCatchupScale;
  const scaledWidth =
    typeof pageWidth === "number" && pageWidth > 0
      ? pageWidth * liveScale
      : contentSize.width > 0
        ? contentSize.width * effectiveScale
        : undefined;
  const scaledHeight =
    contentSize.height > 0 ? contentSize.height * effectiveScale : undefined;
  const handleFirstPageRender = useCallback(() => {
    if (didReportFirstPageRenderRef.current) return;
    didReportFirstPageRenderRef.current = true;
    onFirstPageRender?.();
  }, [onFirstPageRender]);

  return (
    <div
      className="flex flex-col items-center"
      style={{ minWidth: scaledWidth || "fit-content" }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<PdfLoadingShell visibleWidth={effectiveLoadingWidth} />}
        error={
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-app text-[14px] font-medium text-ink">
              Failed to load PDF
            </p>
            <p className="mt-1 font-app text-[13px] text-ink-muted">
              The file may be corrupted or unavailable.
            </p>
          </div>
        }
      >
        <div
          className="relative"
          style={{ width: scaledWidth, height: scaledHeight }}
        >
          <div
            ref={contentRef}
            className="absolute left-0 top-0 flex flex-col items-center gap-3"
            style={{
              transform:
                effectiveScale === 1 ? undefined : `scale(${effectiveScale})`,
              transformOrigin: "top left",
              willChange: effectiveScale !== 1 ? "transform" : undefined,
            }}
          >
            {Array.from({ length: visiblePages }, (_, i) => (
              <BufferedPdfPage
                key={i + 1}
                pageNumber={i + 1}
                pageWidth={pageWidth}
                pageRef={setPageRef(i + 1)}
                onRendered={i === 0 ? handleFirstPageRender : undefined}
              />
            ))}

            {/* Sentinel for progressive loading */}
            {!renderAllPages && visiblePages < numPages && (
              <div ref={sentinelRef} className="flex flex-col items-center gap-3">
                <PageSkeleton width={pageWidth} />
              </div>
            )}
          </div>
        </div>
      </Document>
    </div>
  );
}
