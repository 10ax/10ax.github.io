import Link from "next/link";
import { Reveal } from "@/components/reveal";

export type WritingItem = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

/**
 * The newest post gets the space, the rest are rows. Three equal cards in a row is the
 * layout this page is specifically avoiding.
 */
export function LatestWriting({ posts }: { posts: WritingItem[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;

  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          Latest writing
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <Reveal delay={0.05}>
          <Link href={`/blog/${lead.slug}`} className="focus-ring group block">
            <p className="text-ink-muted font-mono text-xs tabular-nums">{lead.date}</p>
            <h3 className="font-display text-ink group-hover:text-accent mt-2 text-2xl leading-snug font-semibold tracking-tight transition-colors md:text-3xl">
              {lead.title}
            </h3>
            {lead.description && (
              <p className="text-ink-muted mt-3 max-w-[60ch] text-sm leading-relaxed">
                {lead.description}
              </p>
            )}
          </Link>
        </Reveal>
        {rest.length > 0 && (
          <ul className="divide-line divide-y">
            {rest.slice(0, 3).map((post, index) => (
              <li key={post.slug}>
                <Reveal delay={0.1 + index * 0.05}>
                  <Link href={`/blog/${post.slug}`} className="focus-ring group block py-4">
                    <p className="text-ink-muted font-mono text-xs tabular-nums">{post.date}</p>
                    <h3 className="font-display text-ink group-hover:text-accent mt-1 text-base font-semibold tracking-tight transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
