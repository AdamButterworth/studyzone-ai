import { Upload, FileText, Link, Type } from "lucide-react";

export default function FeatureUpload() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-3xl bg-lavender-light/60 p-8 md:p-14">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-14">
            {/* Content */}
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Upload
              </p>
              <h2 className="text-3xl tracking-tight md:text-4xl">
                From raw notes to real understanding
              </h2>
              <p className="mt-4 leading-relaxed text-ink-light">
                Upload PDFs, slides, docs, or paste any text. StudyZone extracts
                every concept and organizes them into a learning path — from
                foundational to advanced.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: FileText, label: "PDF, DOCX, PPTX" },
                  { icon: Type, label: "Paste any text" },
                  { icon: Link, label: "Add links" },
                  { icon: Upload, label: "Drag & drop" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon size={16} className="text-ink-muted" />
                    <span className="text-sm text-ink-light">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="flex-1">
              <div className="relative">
                {/* Back card */}
                <div className="absolute -top-3 left-4 right-4 h-full rounded-2xl border border-black/5 bg-white/50" />
                {/* Main card */}
                <div className="relative rounded-2xl border border-black/5 bg-white p-5 shadow-lg">
                  <div className="mb-4 text-sm font-medium">
                    Reinforcement Learning
                  </div>
                  <div className="rounded-xl border-2 border-dashed border-lavender bg-lavender-light/30 p-8 text-center">
                    <Upload
                      size={28}
                      className="mx-auto mb-3 text-ink-muted"
                    />
                    <p className="text-sm font-medium text-ink">
                      Drop files here
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      PDF, DOCX, PPTX, TXT
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      "lecture-notes-mdp.pdf",
                      "policy-gradients-slides.pptx",
                    ].map((file) => (
                      <div
                        key={file}
                        className="flex items-center gap-2 rounded-lg bg-cream-dark/50 px-3 py-2"
                      >
                        <FileText size={14} className="text-ink-muted" />
                        <span className="text-xs text-ink-light">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
