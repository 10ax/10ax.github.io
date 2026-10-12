import type { Metadata } from "next";
import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog | Francesco Tenace",
  description: "Notes on engineering, homelab tinkering, and other interests.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        title="Notes"
        description="Things I worked out the hard way, written down so the next attempt is shorter."
      />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        {!lead ? (
          <p className="text-ink-muted text-sm">No posts yet. Check back soon.</p>
        ) : (
          <>
            <Reveal>
              <Link href={`/blog/${lead.slug}`} className="focus-ring group block max-w-[70ch]">
                <p className="text-ink-muted tabular inline-flex items-center gap-1.5 font-mono text-xs">
                  <CalendarBlank size={14} weight="regular" aria-hidden />
                  {lead.date}
                </p>
                <h2 className="font-display text-ink group-hover:text-accent mt-3 text-3xl leading-tight font-semibold tracking-tight transition-colors md:text-4xl">
                  {lead.title}
                </h2>
                {lead.description && (
                  <p className="text-ink-muted mt-3 text-base leading-relaxed text-pretty">
                    {lead.description}
                  </p>
                )}
              </Link>
            </Reveal>

            <ul className="divide-line mt-14 divide-y">
              {rest.map((post, index) => (
                <li key={post.slug}>
                  <Reveal delay={index * 0.04}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="focus-ring group grid gap-2 py-6 md:grid-cols-[10rem_1fr]"
                    >
                      <p className="text-ink-muted tabular font-mono text-xs md:pt-1">{post.date}</p>
                      <div>
                        <h3 className="font-display text-ink group-hover:text-accent text-xl font-semibold tracking-tight transition-colors">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-ink-muted mt-2 max-w-[65ch] text-sm leading-relaxed">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
