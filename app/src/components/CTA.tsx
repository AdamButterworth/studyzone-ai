import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-mint-light p-10 text-center md:p-16">
          {/* Subtle decorative brush strokes */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -left-10 top-0 h-full w-1/2 rotate-12 rounded-full bg-mint/40 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-full w-1/3 -rotate-12 rounded-full bg-mint/30 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl tracking-tight italic md:text-5xl">
              Let&apos;s start learning
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-light md:text-lg">
              Start for free. No credit card required.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-ink/80"
              >
                Get Started Free
                <ArrowRight size={16} />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-white/80"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
