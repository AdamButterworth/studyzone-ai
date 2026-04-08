"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  onPageChange?: (page: number, total: number) => void;
  currentPage?: number;
  pageWidth?: number; // pixel width for each page (parent controls this)
}

export default function PdfViewer({
  url,
  onPageChange,
  currentPage: controlledPage,
  pageWidth,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollingToPage = useRef(false);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      onPageChange?.(1, total);
    },
    [onPageChange]
  );

  // Track which page is visible via intersection observer
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
  }, [numPages, onPageChange]);

  // Scroll to page when controlledPage changes (e.g. from toolbar arrows)
  useEffect(() => {
    if (!controlledPage || !pageRefs.current.has(controlledPage)) return;
    const el = pageRefs.current.get(controlledPage);
    if (!el) return;

    scrollingToPage.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const timer = setTimeout(() => {
      scrollingToPage.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [controlledPage]);

  const setPageRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) pageRefs.current.set(pageNum, el);
      else pageRefs.current.delete(pageNum);
    },
    []
  );

  return (
    <div className="flex flex-col items-center">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg bg-white"
                style={{
                  width: pageWidth || "100%",
                  height: (pageWidth || 600) * 1.414,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
                }}
              />
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
          {Array.from({ length: numPages }, (_, i) => (
            <div
              key={i + 1}
              ref={setPageRef(i + 1)}
              data-page={i + 1}
              className="rounded-lg bg-white overflow-hidden"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
              }}
            >
              <Page
                pageNumber={i + 1}
                width={pageWidth || undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}
