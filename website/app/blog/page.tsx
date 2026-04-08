"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Brain, BookOpen, GraduationCap, Coffee } from "lucide-react";

const series = [
  { id: "all", label: "All Posts" },
  { id: "ai-learning", label: "AI & Learning" },
  { id: "how-people-learn", label: "How People Learn" },
  { id: "study-guides", label: "Study Guides" },
  { id: "student-life", label: "Student Life" },
];

const seriesColors: Record<string, { bg: string; text: string }> = {
  "ai-learning": { bg: "bg-lavender-light", text: "text-purple-700" },
  "how-people-learn": { bg: "bg-sky-light", text: "text-blue-700" },
  "study-guides": { bg: "bg-mint-light", text: "text-green-700" },
  "student-life": { bg: "bg-peach-light", text: "text-orange-700" },
};

const seriesIcons: Record<string, typeof Brain> = {
  "ai-learning": Brain,
  "how-people-learn": BookOpen,
  "study-guides": GraduationCap,
  "student-life": Coffee,
};

const featuredPosts = [
  {
    slug: "why-most-ai-study-tools-get-it-wrong",
    title: "Why Most AI Study Tools Get It Wrong",
    excerpt:
      "The problem with 'upload and summarize' — it optimizes for convenience, not comprehension. Here's what actually works.",
    series: "ai-learning",
    date: "Apr 5, 2026",
    coverColor: "from-purple-400 to-indigo-500",
    featured: true,
  },
  {
    slug: "first-principles-learning",
    title: "First Principles Learning: What the Research Says",
    excerpt:
      "Cognitive science behind building knowledge from foundations.",
    series: "ai-learning",
    date: "Apr 3, 2026",
    coverColor: "from-violet-400 to-purple-500",
  },
  {
    slug: "reading-to-understand-vs-reading-to-finish",
    title: "Reading to Understand vs. Reading to Finish",
    excerpt:
      "Active reading strategies vs the trap of 'I read it so I know it.'",
    series: "how-people-learn",
    date: "Apr 1, 2026",
    coverColor: "from-blue-400 to-cyan-500",
  },
];

const allPosts = [
  ...featuredPosts,
  {
    slug: "how-to-study-machine-learning-from-scratch",
    title: "How to Study Machine Learning from Scratch",
    excerpt:
      "The prerequisite chain, recommended resources, and common pitfalls when teaching yourself ML.",
    series: "study-guides",
    date: "Mar 28, 2026",
    coverColor: "from-emerald-400 to-green-500",
  },
  {
    slug: "the-study-schedule-that-actually-works",
    title: "The Study Schedule That Actually Works",
    excerpt:
      "Time blocking, Pomodoro, energy management — backed by research, not hustle culture.",
    series: "student-life",
    date: "Mar 25, 2026",
    coverColor: "from-orange-400 to-rose-500",
  },
  {
    slug: "how-ai-tutors-outperform-traditional-study",
    title: "How AI Tutors Are Outperforming Traditional Study Methods",
    excerpt:
      "Bloom's 2 sigma problem showed 1-on-1 tutoring massively outperforms classrooms. AI is making that scalable.",
    series: "ai-learning",
    date: "Mar 22, 2026",
    coverColor: "from-purple-500 to-pink-500",
  },
  {
    slug: "youtube-university-how-to-actually-learn-from-video",
    title: "YouTube University: How to Actually Learn from Video Content",
    excerpt:
      "The difference between watching and learning. How to extract real knowledge from lecture videos.",
    series: "how-people-learn",
    date: "Mar 20, 2026",
    coverColor: "from-sky-400 to-blue-500",
  },
  {
    slug: "flashcards-done-right",
    title: "Flashcards Done Right: Beyond Brute-Force Memorization",
    excerpt:
      "How to write good flashcards (atomic, conceptual, connected) vs bad ones (copy-paste definitions).",
    series: "how-people-learn",
    date: "Mar 17, 2026",
    coverColor: "from-cyan-400 to-teal-500",
  },
  {
    slug: "how-to-prepare-for-finals-in-one-week",
    title: "How to Prepare for Finals in One Week (Realistically)",
    excerpt:
      "Triage strategy: what to focus on, what to skip, and how AI can accelerate your review.",
    series: "student-life",
    date: "Mar 14, 2026",
    coverColor: "from-amber-400 to-orange-500",
  },
];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredPosts =
    activeFilter === "all"
      ? allPosts
      : allPosts.filter((p) => p.series === activeFilter);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-20">
        {/* Featured section */}
        <div className="pt-32 pb-16 md:pt-40">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            {/* Main featured post */}
            <a href={`/blog/${featuredPosts[0].slug}`} className="group">
              <div
                className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${featuredPosts[0].coverColor} flex items-end p-6 md:p-8`}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = seriesIcons[featuredPosts[0].series];
                    return Icon ? <Icon size={20} className="text-white/80" /> : null;
                  })()}
                  <span className="text-sm font-medium text-white/80">
                    {series.find((s) => s.id === featuredPosts[0].series)?.label}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                {featuredPosts[0].date}
              </p>
              <h2 className="mt-1 text-2xl tracking-tight group-hover:underline md:text-3xl">
                {featuredPosts[0].title}
              </h2>
              <p className="mt-2 text-ink-light">
                {featuredPosts[0].excerpt}
              </p>
            </a>

            {/* Side featured posts */}
            <div className="flex flex-col gap-6">
              {featuredPosts.slice(1).map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <div
                    className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${post.coverColor} flex items-end p-4`}
                  >
                    <span className="text-xs font-medium text-white/80">
                      {series.find((s) => s.id === post.series)?.label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">{post.date}</p>
                  <h3 className="mt-0.5 text-sm font-semibold font-[family-name:var(--font-dm-sans)] group-hover:underline">
                    {post.title}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Explore section */}
        <section className="pb-20">
          <h2 className="text-center text-3xl tracking-tight md:text-4xl">
            Explore the StudyZone Blog
          </h2>

          {/* Filter chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {series.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveFilter(s.id)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                  activeFilter === s.id
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white text-ink-light hover:border-black/20 hover:text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {filteredPosts.map((post) => {
              const colors = seriesColors[post.series];
              return (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <div
                    className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${post.coverColor} flex items-end p-4`}
                  >
                    <span className="text-xs font-medium text-white/80">
                      {series.find((s) => s.id === post.series)?.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors?.bg} ${colors?.text}`}
                    >
                      {series.find((s) => s.id === post.series)?.label}
                    </span>
                    <span className="text-xs text-ink-muted">{post.date}</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold font-[family-name:var(--font-dm-sans)] group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-light line-clamp-2">
                    {post.excerpt}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
