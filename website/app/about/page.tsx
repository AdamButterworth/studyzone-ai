import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { BookOpen, Sparkles, Users, GraduationCap } from "lucide-react";

export const metadata = {
  title: "About — StudyZone AI",
  description: "Learn about StudyZone AI and our mission to make learning from first principles accessible to everyone.",
};

const values = [
  {
    icon: BookOpen,
    title: "First Principles",
    description:
      "We believe real understanding comes from building knowledge from the ground up, not skimming summaries.",
  },
  {
    icon: Sparkles,
    title: "AI as a Tutor",
    description:
      "AI should teach and guide, not just regurgitate. Every feature is designed to build comprehension.",
  },
  {
    icon: Users,
    title: "Built for Learners",
    description:
      "From med students to self-taught engineers, we design for anyone who wants to truly master a subject.",
  },
  {
    icon: GraduationCap,
    title: "By Students, for Students",
    description:
      "StudyZone was born out of Stanford's CS224R. We know the pain of dense materials and tight deadlines.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6">
        <PageHeader
          title="About StudyZone AI"
          subtitle="We're building the AI tutor we wish we had — one that teaches from first principles instead of just summarizing your notes."
        />

        {/* Story */}
        <section className="pb-16">
          <div className="rounded-2xl bg-lavender-light/40 p-8 md:p-12">
            <h2 className="text-2xl tracking-tight md:text-3xl">Our Story</h2>
            <div className="mt-6 space-y-4 text-ink-light leading-relaxed">
              <p>
                StudyZone AI started as a project at Stanford. We were drowning in lecture
                slides, research papers, and textbook chapters — and the AI tools we tried
                just gave us summaries. Summaries don&apos;t build understanding.
              </p>
              <p>
                We wanted something different: a tool that figures out what you need to
                learn first, explains foundational concepts before building up to advanced
                ones, and checks your understanding along the way. Like the best tutor you
                ever had, but available 24/7.
              </p>
              <p>
                That&apos;s what we&apos;re building. StudyZone AI analyzes your materials,
                maps out concept dependencies, and creates a guided learning path tailored
                to your content. It doesn&apos;t just tell you what&apos;s in the document —
                it teaches you.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="pb-20">
          <h2 className="mb-10 text-center text-2xl tracking-tight md:text-3xl">
            What We Believe
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-black/5 bg-white p-6"
              >
                <Icon size={22} strokeWidth={1.5} className="mb-3 text-ink-muted" />
                <h3 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-light">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
