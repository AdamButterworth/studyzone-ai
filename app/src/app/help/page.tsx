"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Upload,
  BookOpen,
  HelpCircle,
  Layers,
  MessageSquare,
  Send,
  ChevronDown,
} from "lucide-react";

const topics = [
  {
    icon: Upload,
    title: "Uploading Content",
    items: [
      {
        q: "What file types can I upload?",
        a: "StudyZone supports PDF, DOCX, PPTX, and TXT files. You can also paste text directly or add links to web pages.",
      },
      {
        q: "What's the maximum file size?",
        a: "Free accounts can upload files up to 10MB. Pro accounts support files up to 50MB.",
      },
      {
        q: "Can I upload multiple files at once?",
        a: "Yes! You can drag and drop multiple files into any learning path. They'll be processed in parallel.",
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Learning Paths",
    items: [
      {
        q: "What is a learning path?",
        a: "A learning path is a collection of materials focused on one topic (e.g., 'Reinforcement Learning'). You upload your study materials and StudyZone creates a structured learning experience.",
      },
      {
        q: "How many learning paths can I create?",
        a: "Free accounts can create up to 3 learning paths. Pro accounts have unlimited learning paths.",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "AI Features",
    items: [
      {
        q: "How does guided learning work?",
        a: "StudyZone's AI analyzes your materials, identifies all concepts and their prerequisites, and creates a lesson plan that teaches foundational concepts first. It checks your understanding at each step before moving on.",
      },
      {
        q: "Are AI responses always accurate?",
        a: "While our AI strives for accuracy, it can occasionally make mistakes. Always verify critical information independently, especially for exams or professional work.",
      },
    ],
  },
  {
    icon: HelpCircle,
    title: "Quizzes & Flashcards",
    items: [
      {
        q: "How are quizzes generated?",
        a: "Quizzes are generated from your uploaded materials using AI. You can choose multiple choice, free response, or both. Questions are designed to test understanding, not just memorization.",
      },
      {
        q: "Can I customize flashcard decks?",
        a: "Yes — you can edit, add, or remove cards from any generated deck. You can also create flashcards from highlighted text in your documents.",
      },
    ],
  },
  {
    icon: Layers,
    title: "Account & Billing",
    items: [
      {
        q: "How do I upgrade to Pro?",
        a: "Go to Settings > Subscription and click 'Upgrade to Pro'. You can pay monthly or annually.",
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes, you can cancel anytime from Settings. You'll keep Pro access until the end of your billing period.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="mx-auto max-w-4xl px-6 pb-20">
        <PageHeader
          title="Help Center"
          subtitle="Find answers to common questions or get in touch with our team."
        />

        {/* FAQ Topics */}
        <section className="pb-16">
          <div className="space-y-6">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="rounded-2xl border border-black/5 bg-white p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <topic.icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-ink-muted"
                  />
                  <h2 className="text-lg font-semibold font-[family-name:var(--font-dm-sans)]">
                    {topic.title}
                  </h2>
                </div>

                <div className="divide-y divide-black/5">
                  {topic.items.map((item) => {
                    const key = `${topic.title}-${item.q}`;
                    return (
                      <div key={key} className="py-3">
                        <button
                          className="flex w-full items-center justify-between text-left"
                          onClick={() => toggleItem(key)}
                        >
                          <span className="text-sm font-medium">{item.q}</span>
                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-ink-muted transition-transform ${
                              openItems[key] ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {openItems[key] && (
                          <p className="mt-2 text-sm leading-relaxed text-ink-light">
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <div className="rounded-2xl bg-lavender-light/40 p-8 md:p-12">
            <h2 className="text-2xl tracking-tight md:text-3xl">
              Still need help?
            </h2>
            <p className="mt-2 text-ink-light">
              Send us a message and we&apos;ll get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-xl border border-mint bg-mint-light/50 p-6 text-center">
                <p className="font-medium text-ink">Message sent!</p>
                <p className="mt-1 text-sm text-ink-light">
                  We&apos;ll get back to you at {formState.email} within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-ink/30"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-ink/30"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-ink/30"
                    placeholder="What do you need help with?"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-ink/30"
                    placeholder="Describe your issue or question..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink/80"
                >
                  Send Message
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </section>
    </main>
  );
}
