"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  const roles = [
    "High School Student",
    "College / University Student",
    "Graduate Student",
    "Self-Learner",
    "Educator / Teacher",
    "Professional",
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55"
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      />
      <div className="absolute inset-0 bg-cream/50" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-5 flex justify-center">
          <div className="rounded-2xl bg-white p-3 shadow-lg shadow-black/5">
            <img src="/icon.svg" alt="StudyZone AI" className="h-10 w-10" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 px-8 py-10 shadow-xl shadow-black/5 backdrop-blur-xl">
          {/* Step 1: Name */}
          {step === 0 && (
            <>
              <h1 className="text-center text-2xl font-semibold tracking-tight font-[family-name:var(--font-dm-sans)]">
                What&apos;s your name?
              </h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(1);
                }}
                className="mt-8 space-y-3"
              >
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-muted focus:border-ink/30"
                />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-muted focus:border-ink/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#5B8DEF] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {/* Step 2: Role */}
          {step === 1 && (
            <>
              <h1 className="text-center text-2xl font-semibold tracking-tight font-[family-name:var(--font-dm-sans)]">
                How do you learn?
              </h1>
              <p className="mt-2 text-center text-sm text-ink-light">
                This helps us personalize your experience
              </p>
              <div className="mt-8 space-y-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      role === r
                        ? "border-[#7C5CFC] bg-lavender-light/50 font-medium text-ink"
                        : "border-black/10 bg-white text-ink-light hover:border-black/20 hover:bg-cream-dark/30"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!role}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#5B8DEF] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-55"
              >
                Continue
              </button>
            </>
          )}

          {/* Step 3: Ready */}
          {step === 2 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint-light">
                <span className="text-2xl">🎉</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-dm-sans)]">
                You&apos;re all set, {firstName}!
              </h1>
              <p className="mt-2 text-sm text-ink-light">
                Let&apos;s create your first learning path.
              </p>
              <a
                href="/app"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#5B8DEF] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Start Learning
                <ArrowRight size={16} />
              </a>
            </div>
          )}

          {/* Progress dots */}
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-[#7C5CFC]"
                    : i < step
                      ? "w-1.5 bg-[#7C5CFC]/40"
                      : "w-1.5 bg-black/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
