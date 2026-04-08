import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started and exploring.",
    features: [
      "3 learning paths",
      "5 uploads per path",
      "AI chat & explanations",
      "Quizzes & flashcards",
      "Basic summaries & notes",
    ],
    cta: "Get Started",
    ctaStyle:
      "rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink/80",
    cardStyle: "bg-white border border-black/5",
  },
  {
    name: "StudyZone Pro",
    price: "$9.99",
    period: "/month",
    description: "For serious learners who want the full experience.",
    features: [
      "Unlimited learning paths",
      "Unlimited uploads",
      "Guided learning mode",
      "Lesson plan generation",
      "Priority AI responses",
      "Progress tracking & analytics",
    ],
    cta: "Upgrade to Pro",
    ctaStyle:
      "rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20",
    cardStyle: "bg-ink text-white",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Pricing
          </p>
          <h2 className="text-3xl tracking-tight md:text-4xl">
            Your pace, your plan
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-light">
            Start learning for free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${plan.cardStyle}`}
            >
              <h3 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)]">{plan.name}</h3>
              <p
                className={`mt-1 text-sm ${plan.name === "StudyZone Pro" ? "text-white/60" : "text-ink-muted"}`}
              >
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight font-[family-name:var(--font-dm-sans)]">
                  {plan.price}
                </span>
                <span
                  className={`text-sm ${plan.name === "StudyZone Pro" ? "text-white/50" : "text-ink-muted"}`}
                >
                  {plan.period}
                </span>
              </div>

              <a href="https://app.studyzoneai.com/login" className={`mt-6 inline-block ${plan.ctaStyle}`}>
                {plan.cta}
              </a>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check
                      size={15}
                      className={
                        plan.name === "StudyZone Pro"
                          ? "text-white/50"
                          : "text-ink-muted"
                      }
                    />
                    <span
                      className={`text-sm ${plan.name === "StudyZone Pro" ? "text-white/80" : "text-ink-light"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
