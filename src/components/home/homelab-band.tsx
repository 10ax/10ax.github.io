import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

const FACTS = [
  { label: "Host", value: "Odroid HC4, Arch Linux" },
  { label: "Runtime", value: "Docker Compose, native systemd where it fits" },
  { label: "On it", value: "DNS, smart home, reverse proxy, media automation" },
] as const;

export function HomelabBand() {
  return (
    <section className="border-line bg-sunken border-y">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
        <Reveal>
          <div className="border-line relative aspect-[4/3] overflow-hidden rounded-panel border">
            {/* TODO: replace with the real rack photograph at /public/homelab/rack.jpg. */}
            <Image
              src="/homelab/rack-placeholder.svg"
              alt="The homelab rack"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <div>
          <Reveal delay={0.05}>
            <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
              A small rack that does a lot
            </h2>
          </Reveal>
          <dl className="mt-8 flex flex-col gap-5">
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
          <Reveal delay={0.25}>
            <Link
              href="/homelab"
              className="focus-ring text-accent mt-8 inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              See what runs on it
              <ArrowUpRight size={16} weight="regular" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
