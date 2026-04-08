import { CheckCircle2, Circle, ArrowDown } from "lucide-react";

export default function FeatureGuided() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-3xl bg-amber-light/60 p-8 md:p-14">
          <div className="flex flex-col items-center gap-10 md:flex-row-reverse md:gap-14">
            {/* Content */}
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Guided Learning
              </p>
              <h2 className="text-3xl tracking-tight md:text-4xl">
                A tutor that builds understanding step by step
              </h2>
              <p className="mt-4 leading-relaxed text-ink-light">
                Most AI tools summarize. StudyZone teaches. It identifies
                prerequisite concepts, orders them from foundational to advanced,
                and walks you through each one — checking your understanding
                before moving on.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Concept dependency mapping",
                  "Step-by-step walkthroughs",
                  "Comprehension checks at each step",
                  '"Teach me this" for any selected text',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-ink-muted"
                    />
                    <span className="text-sm text-ink-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual - Lesson plan steps */}
            <div className="flex-1">
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-lg">
                <div className="mb-4 text-sm font-medium">
                  Lesson Plan: Reinforcement Learning
                </div>

                <div className="space-y-0">
                  {/* Step 1 - completed */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <CheckCircle2
                        size={22}
                        className="shrink-0 text-mint"
                      />
                      <div className="w-px flex-1 bg-mint" />
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-medium">
                        Markov Decision Processes
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        States, actions, transitions, rewards
                      </p>
                      <div className="mt-2 inline-block rounded-full bg-mint/20 px-2 py-0.5 text-[10px] font-medium text-ink">
                        Mastered
                      </div>
                    </div>
                  </div>

                  {/* Step 2 - completed */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <CheckCircle2
                        size={22}
                        className="shrink-0 text-mint"
                      />
                      <div className="w-px flex-1 bg-mint" />
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-medium">
                        Value Functions
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        V(s), Q(s,a), Bellman equations
                      </p>
                      <div className="mt-2 inline-block rounded-full bg-mint/20 px-2 py-0.5 text-[10px] font-medium text-ink">
                        Mastered
                      </div>
                    </div>
                  </div>

                  {/* Step 3 - current */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-lavender bg-lavender-light">
                        <ArrowDown size={12} className="text-ink" />
                      </div>
                      <div className="w-px flex-1 bg-black/10" />
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-medium">
                        Policy Gradient Methods
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        REINFORCE, advantage functions
                      </p>
                      <div className="mt-2 inline-block rounded-full bg-lavender/30 px-2 py-0.5 text-[10px] font-medium text-ink">
                        In progress
                      </div>
                    </div>
                  </div>

                  {/* Step 4 - upcoming */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <Circle
                        size={22}
                        className="shrink-0 text-ink-muted/40"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-muted">
                        Actor-Critic & PPO
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted/60">
                        Combining value & policy methods
                      </p>
                    </div>
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
