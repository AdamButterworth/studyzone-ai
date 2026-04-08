import {
  MessageSquare,
  ListOrdered,
  HelpCircle,
  Layers,
  StickyNote,
} from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI Tutor" },
  { icon: ListOrdered, label: "Lesson Plans" },
  { icon: HelpCircle, label: "Quizzes" },
  { icon: Layers, label: "Flashcards" },
  { icon: StickyNote, label: "Notes" },
];

export default function FeatureIcons() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-4xl tracking-tight md:text-6xl">
          Everything you need to{" "}
          <em className="italic">truly</em> learn
        </h2>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-4">
              <Icon size={36} strokeWidth={1.5} className="text-ink" />
              <span className="text-base text-ink-light md:text-lg">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
