"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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

/* ─── Props ─── */
interface PdfViewerProps {
  url: string;
  onPageChange?: (page: number, total: number) => void;
  currentPage?: number;
  pageWidth?: number;
  renderAllPages?: boolean;
  initialRenderCount?: number;
  renderBatchSize?: number;
}

export default function PdfViewer({
  url,
  onPageChange,
  currentPage: controlledPage,
  pageWidth,
  renderAllPages = false,
  initialRenderCount = 3,
  renderBatchSize = 4,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [visiblePages, setVisiblePages] = useState(0);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollingToPage = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
      setVisiblePages(numPages);
    }
  }, [renderAllPages, numPages]);

  /* ── Bottom sentinel — load more pages as user scrolls ── */
  useEffect(() => {
    if (renderAllPages || numPages === 0) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisiblePages((prev) => Math.min(prev + renderBatchSize, numPages));
        }
      },
      { rootMargin: "800px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [numPages, renderAllPages, renderBatchSize]);

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

  return (
    <div
      className="flex flex-col items-center"
      style={{ minWidth: "fit-content" }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center gap-3">
            {[1, 2].map((i) => (
              <PageSkeleton key={i} width={pageWidth} />
            ))}
          </div>
        }
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
        <div className="flex flex-col items-center gap-3">
          {Array.from({ length: visiblePages }, (_, i) => (
            <div
              key={i + 1}
              ref={setPageRef(i + 1)}
              data-page={i + 1}
              className="rounded-lg bg-white overflow-hidden"
              style={{ boxShadow: PAGE_SHADOW }}
            >
              <Page
                pageNumber={i + 1}
                width={pageWidth || undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<PageSkeleton width={pageWidth} />}
                error={<PageError width={pageWidth} />}
              />
            </div>
          ))}

          {/* Sentinel for progressive loading */}
          {!renderAllPages && visiblePages < numPages && (
            <div ref={sentinelRef} className="flex flex-col items-center gap-3">
              <PageSkeleton width={pageWidth} />
            </div>
          )}
        </div>
      </Document>
    </div>
  );
}
