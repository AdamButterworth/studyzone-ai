interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="pt-32 pb-12 text-center md:pt-40 md:pb-16">
      <h1 className="text-4xl tracking-tight md:text-5xl">{title}</h1>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-xl text-ink-light md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
