"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a magic link to sign in.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

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
        {/* Logo floating above card */}
        <div className="mb-5 flex justify-center">
          <div className="rounded-2xl bg-white p-3 shadow-lg shadow-black/5">
            <img src="/icon.svg" alt="StudyZone AI" className="h-10 w-10" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 px-8 py-10 shadow-xl shadow-black/5 backdrop-blur-xl">
          <h1 className="text-center text-2xl font-semibold tracking-tight font-[family-name:var(--font-dm-sans)]">
            Welcome to StudyZone AI
          </h1>
          <p className="mt-2 text-center text-sm text-ink-light">
            Enter your email to log in or sign up
          </p>

          {/* Success message */}
          {message && (
            <div className="mt-6 rounded-xl bg-mint-light/50 px-4 py-3 text-center text-sm text-ink-light">
              {message}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-6 rounded-xl bg-peach-light/50 px-4 py-3 text-center text-sm text-red-600/80">
              {error}
            </div>
          )}

          {/* Email form */}
          {!message && (
            <>
              <form onSubmit={handleEmailLogin} className="mt-8">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-muted focus:border-ink/30"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#5B8DEF] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Sending link..." : "Continue"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-xs text-ink-muted">or</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white py-3 text-sm font-medium transition-colors hover:bg-cream-dark/50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-ink-muted">
            By continuing, you accept our{" "}
            <a href="/terms" className="underline hover:text-ink">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-ink">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
