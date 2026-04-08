"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is StudyZone AI?",
    a: "StudyZone AI is a learning platform that turns your notes, slides, and documents into guided, interactive learning experiences. Instead of just summarizing your content, it teaches you from first principles.",
  },
  {
    q: "How is this different from ChatGPT or YouLearn?",
    a: "Most AI tools process each document in isolation — you upload, you get a summary. StudyZone identifies prerequisite concepts across your materials, orders them from foundational to advanced, and walks you through step by step with comprehension checks.",
  },
  {
    q: "What file types can I upload?",
    a: "You can upload PDFs, Word documents (DOCX), PowerPoint slides (PPTX), and plain text files. You can also paste text directly or add links to web pages.",
  },
  {
    q: "How does guided learning work?",
    a: "When you upload materials, StudyZone's AI analyzes all the concepts and builds a dependency map. It then creates a lesson plan that teaches foundational concepts first, building up to advanced topics. At each step, it checks your understanding before moving on.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your uploaded files and learning data are stored securely and never shared with third parties. We use encryption in transit and at rest.",
  },
  {
    q: "Is it really free?",
    a: "Yes! The free plan gives you 3 learning paths with 5 uploads each, plus full access to AI chat, quizzes, and flashcards. The Pro plan unlocks unlimited paths, guided learning mode, and more.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center text-3xl tracking-tight md:text-4xl">
          Common Questions
        </h2>

        <div className="mt-12 divide-y divide-black/5">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-sm font-medium md:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-ink-muted transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <p className="mt-3 text-sm leading-relaxed text-ink-light">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
