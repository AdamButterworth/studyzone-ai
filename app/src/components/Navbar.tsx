"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Help", href: "/help" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className="w-full max-w-4xl rounded-2xl border border-black/[0.06] bg-white/70 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-5">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="StudyZone AI" className="h-7 w-7" />
            <span className="text-base font-semibold tracking-tight font-[family-name:var(--font-dm-sans)]">
              StudyZone AI
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-ink-light transition-colors hover:text-ink"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="text-sm text-ink-light transition-colors hover:text-ink"
            >
              Log in
            </a>
            <a
              href="/login"
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/80"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-black/5 px-5 pb-5 md:hidden">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-ink-light transition-colors hover:text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-black/5" />
              <a href="/login" className="text-sm text-ink-light">
                Log in
              </a>
              <a
                href="/login"
                className="rounded-full bg-ink px-5 py-2.5 text-center text-sm font-medium text-white"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
