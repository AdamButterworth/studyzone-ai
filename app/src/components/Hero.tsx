import {
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-32 h-96 w-96 rounded-full bg-lavender/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-32 h-80 w-80 rounded-full bg-sky/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-peach/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-4 py-1.5 text-sm text-ink-light">
            <Sparkles size={14} />
            Free during beta
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-5xl leading-tight tracking-tight md:text-7xl md:leading-[1.1]">
            Your AI tutor that{" "}
            <em className="not-italic text-lavender-light relative">
              <span className="relative z-10 text-ink">teaches</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-4 bg-lavender/50 md:h-5" />
            </em>
            , not just summarizes
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-light md:text-xl">
            Upload your notes, slides, and papers. StudyZone builds a learning
            path from first principles — so you actually understand.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-ink/80"
            >
              Start Learning Free
              <ArrowRight size={16} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-white/80"
            >
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-ink-muted">
            Trusted by students at Stanford, MIT, and UC Berkeley
          </p>

          {/* Hero product mockup */}
          <div className="relative mt-16 w-full max-w-4xl">
            {/* Main card */}
            <div className="rounded-2xl border border-black/5 bg-white p-2 shadow-2xl shadow-black/5">
              <div className="rounded-xl bg-cream-dark/50 p-6 md:p-8">
                {/* Fake product UI */}
                <div className="flex gap-4">
                  {/* Left panel - document */}
                  <div className="hidden flex-1 rounded-lg border border-black/5 bg-white p-5 md:block">
                    <div className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
                      <FileText size={14} />
                      reinforcement-learning.pdf
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-3/4 rounded bg-ink/10" />
                      <div className="h-3 w-full rounded bg-ink/10" />
                      <div className="h-3 w-5/6 rounded bg-ink/10" />
                      <div className="h-3 w-2/3 rounded bg-ink/10" />
                      <div className="mt-6 h-3 w-4/5 rounded bg-ink/10" />
                      <div className="h-3 w-full rounded bg-ink/10" />
                      <div className="h-3 w-3/5 rounded bg-ink/10" />
                    </div>
                  </div>

                  {/* Right panel - AI tools */}
                  <div className="flex-1 space-y-3 md:max-w-xs">
                    <div className="rounded-lg border border-black/5 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <BookOpen size={14} className="text-lavender" />
                        Lesson Plan
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-[10px] font-bold text-ink">
                            1
                          </div>
                          <span className="text-ink-light">
                            Markov Decision Processes
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-lavender text-[10px] font-bold text-ink">
                            2
                          </div>
                          <span className="text-ink-light">
                            Value Functions & Bellman Equations
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber text-[10px] font-bold text-ink">
                            3
                          </div>
                          <span className="text-ink-light">
                            Policy Gradient Methods
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-black/5 bg-white p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <MessageSquare size={14} className="text-sky" />
                        AI Chat
                      </div>
                      <div className="rounded-lg bg-cream-dark/50 px-3 py-2 text-xs text-ink-muted">
                        Explain the Bellman equation in simple terms...
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-black/5 bg-white px-3 py-2.5 text-center text-xs font-medium text-ink-light">
                        Quiz
                      </div>
                      <div className="rounded-lg border border-black/5 bg-white px-3 py-2.5 text-center text-xs font-medium text-ink-light">
                        Flashcards
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent cards */}
            <div className="absolute -left-4 top-12 hidden rounded-xl border border-black/5 bg-white px-4 py-3 shadow-lg lg:block">
              <div className="flex items-center gap-2 text-xs font-medium">
                <div className="h-2 w-2 rounded-full bg-mint" />
                Concept mastered
              </div>
            </div>
            <div className="absolute -right-4 bottom-16 hidden rounded-xl border border-black/5 bg-white px-4 py-3 shadow-lg lg:block">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Sparkles size={12} className="text-amber" />
                Quiz score: 95%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
