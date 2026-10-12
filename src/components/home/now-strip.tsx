import { Reveal } from "@/components/reveal";

const FACTS = [
  { label: "Building", value: "Industrial machinery orchestration, .NET 9 and Orleans" },
  { label: "Running", value: "An Odroid HC4 on Arch Linux holding this site's music page up" },
  { label: "Playing", value: "Progressive rock, mostly Steven Wilson and King Crimson" },
] as const;

export function NowStrip() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          What I am doing right now
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <Reveal delay={0.05}>
          <p className="text-ink-muted max-w-[65ch] text-base leading-relaxed text-pretty">
            Full-stack developer by trade, Linux tinkerer by habit. I build distributed
            systems for a living, and I run the machines this site lives on for the same
            reason anyone climbs a hill: to see whether it holds.
          </p>
        </Reveal>
        <dl className="flex flex-col gap-6">
          {FACTS.map((fact, index) => (
            <Reveal
              key={fact.label}
              delay={0.1 + index * 0.05}
              className="border-line border-l-2 pl-4"
            >
              <dt className="text-ink-muted font-mono text-xs tracking-wide uppercase">
                {fact.label}
              </dt>
              <dd className="text-ink mt-1 text-sm leading-relaxed">{fact.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
