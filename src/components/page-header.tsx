export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <p className="mb-2 font-mono text-sm text-emerald-400">$ {eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
