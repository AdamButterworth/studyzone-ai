import { HelpCircle, Layers, FileText } from "lucide-react";

const tools = [
  {
    icon: HelpCircle,
    title: "Quizzes",
    description:
      "Multiple choice and free response questions generated from your actual materials.",
    accent: "bg-mint-light",
    iconColor: "text-mint",
    mockContent: (
      <div className="space-y-3">
        <div className="rounded-lg bg-white/80 p-3">
          <p className="text-xs font-medium text-ink">
            What is the key difference between on-policy and off-policy learning?
          </p>
          <div className="mt-2 space-y-1.5">
            {["A) Learning rate", "B) Data source", "C) Network size", "D) Reward function"].map(
              (opt) => (
                <div
                  key={opt}
                  className="rounded-md border border-black/5 bg-white px-2.5 py-1.5 text-[11px] text-ink-light"
                >
                  {opt}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Layers,
    title: "Flashcards",
    description:
      "Key concepts turned into spaced-repetition flashcard decks you can study anywhere.",
    accent: "bg-sky-light",
    iconColor: "text-sky",
    mockContent: (
      <div className="flex flex-col items-center justify-center rounded-lg bg-white/80 p-6">
        <p className="text-center text-xs font-medium text-ink">
          Bellman Optimality Equation
        </p>
        <div className="my-3 h-px w-12 bg-black/10" />
        <p className="text-center text-[11px] leading-relaxed text-ink-muted">
          V*(s) = max_a Σ P(s&apos;|s,a)[R + γV*(s&apos;)]
        </p>
        <div className="mt-4 flex gap-3">
          <div className="rounded-full bg-peach/50 px-3 py-1 text-[10px] font-medium">
            Again
          </div>
          <div className="rounded-full bg-mint/50 px-3 py-1 text-[10px] font-medium">
            Good
          </div>
          <div className="rounded-full bg-sky/50 px-3 py-1 text-[10px] font-medium">
            Easy
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Notes & Summary",
    description:
      "Structured notes that highlight key concepts, definitions, and relationships.",
    accent: "bg-peach-light",
    iconColor: "text-peach",
    mockContent: (
      <div className="space-y-2 rounded-lg bg-white/80 p-3">
        <div className="text-[11px] font-semibold text-ink">Key Concepts</div>
        <div className="space-y-1.5">
          {[
            "MDP provides the mathematical framework",
            "Value functions estimate expected returns",
            "Policy gradients optimize directly",
          ].map((note) => (
            <div key={note} className="flex items-start gap-1.5">
              <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-muted" />
              <p className="text-[11px] leading-relaxed text-ink-light">
                {note}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function FeatureTools() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl tracking-tight md:text-4xl">
            Every study tool, powered by your content
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-light">
            Generate quizzes, flashcards, summaries, and notes — all tailored to
            your actual materials.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tools.map(({ icon: Icon, title, description, accent, iconColor, mockContent }) => (
            <div
              key={title}
              className={`rounded-2xl ${accent} p-6`}
            >
              <div className="mb-4 flex items-center gap-2">
                <Icon size={18} className={iconColor} />
                <h3 className="text-lg font-[family-name:var(--font-dm-sans)] font-semibold">{title}</h3>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-ink-light">
                {description}
              </p>
              {mockContent}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
