type HeroHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function HeroHeader({ eyebrow, title, subtitle, children }: HeroHeaderProps) {
  return (
    <section className="premium-grid overflow-hidden rounded-lg bg-[#0b0d12] px-5 py-8 text-white shadow-xl shadow-black/10 sm:px-8 lg:px-10">
      <div className="max-w-4xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
