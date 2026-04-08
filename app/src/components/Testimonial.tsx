interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
}

export default function Testimonial({ quote, name, role }: TestimonialProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12">
          <blockquote className="flex-1 text-2xl leading-relaxed tracking-tight italic md:text-3xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <div className="shrink-0">
            <div className="mb-1 h-px w-12 bg-black/10 md:mb-2" />
            <p className="text-sm font-medium">{name}</p>
            <p className="text-sm text-ink-muted">{role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
