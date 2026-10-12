import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { ArrowLeft, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { ReadingProgress } from "@/components/reading-progress";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: "github-dark-dimmed", light: "github-light" },
  keepBackground: false,
  defaultLang: "plaintext",
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} | Blog`,
    description: post.description,
  };
}

const mdxComponents = {
  // The page owns the single `h1` (the post title), so each mapped heading is demoted one
  // level: MDX `h1` renders `h2`, and so on. The outline stays contiguous and the page
  // keeps exactly one `h1`. Each level keeps its own visual size, so the largest type
  // stays on the first mapped heading.
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-display text-ink mt-10 text-3xl font-semibold tracking-tight" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-display text-ink mt-10 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="font-display text-ink mt-8 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-ink-muted mt-4 max-w-[65ch] leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-accent focus-ring underline-offset-4 hover:underline" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-ink-muted mt-4 max-w-[65ch] list-disc space-y-1 pl-6" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-ink-muted mt-4 max-w-[65ch] list-decimal space-y-1 pl-6" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { "data-language"?: string }) => {
    if (props["data-language"]) return <code {...props} />;
    return (
      <code
        className="bg-sunken text-accent rounded-chip px-1.5 py-0.5 font-mono text-sm"
        {...props}
      />
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={[
        "border-line bg-sunken mt-6 overflow-x-auto rounded-panel border py-4 text-sm leading-relaxed",
        "[&_code]:bg-transparent [&_code]:p-0 [&_code]:text-ink",
        "[&_code>span[data-line]]:block [&_code>span[data-line]]:px-4",
        "[&_code>span[data-highlighted-line]]:bg-accent/10",
        "[&_code>span[data-highlighted-line]]:border-accent [&_code>span[data-highlighted-line]]:border-l-2",
        "[&_code>span[data-highlighted-line]]:pl-[14px]",
        "[&_mark[data-highlighted-chars]]:bg-accent/20 [&_mark[data-highlighted-chars]]:rounded",
        "[&_mark[data-highlighted-chars]]:px-1",
        // Line numbers: the `content-[counter(line)]` utility sets --tw-content, while a
        // raw `content: counter(line)` declaration is clobbered by any `before:*` utility,
        // which re-emits `content: var(--tw-content)`. Scoped to
        // `code[data-line-numbers]`, not `pre` (commit 951770d).
        "[&_code[data-line-numbers]]:[counter-reset:line]",
        "[&_code[data-line-numbers]>span[data-line]]:before:content-[counter(line)]",
        "[&_code[data-line-numbers]>span[data-line]]:before:[counter-increment:line]",
        "[&_code[data-line-numbers]>span[data-line]]:before:mr-4 [&_code[data-line-numbers]>span[data-line]]:before:inline-block",
        "[&_code[data-line-numbers]>span[data-line]]:before:w-6 [&_code[data-line-numbers]>span[data-line]]:before:text-right",
        "[&_code[data-line-numbers]>span[data-line]]:before:text-ink-muted [&_code[data-line-numbers]>span[data-line]]:before:tabular-nums",
      ].join(" ")}
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-ink font-semibold" {...props} />
  ),
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const posts = await getAllPosts();
  const index = posts.findIndex((candidate) => candidate.slug === slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <>
      <ReadingProgress />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <Link
          href="/blog"
          className="focus-ring text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft size={16} weight="regular" aria-hidden />
          All notes
        </Link>
        <article className="mt-8">
          <p className="text-ink-muted tabular inline-flex items-center gap-1.5 font-mono text-xs">
            <CalendarBlank size={14} weight="regular" aria-hidden />
            {post.date}
          </p>
          <h1 className="font-display text-ink mt-3 max-w-[25ch] text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-ink-muted mt-3 max-w-[65ch] text-lg leading-relaxed text-pretty">
              {post.description}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-line text-ink-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <div className="border-line mt-10 border-t pt-8">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
                },
              }}
            />
          </div>
        </article>

        <nav aria-label="More posts" className="border-line mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {newer && (
            <Link href={`/blog/${newer.slug}`} className="focus-ring group">
              <span className="text-ink-muted block font-mono text-xs">Newer</span>
              <span className="font-display text-ink group-hover:text-accent mt-1 block text-lg font-semibold tracking-tight transition-colors">
                {newer.title}
              </span>
            </Link>
          )}
          {older && (
            <Link href={`/blog/${older.slug}`} className="focus-ring group sm:text-right">
              <span className="text-ink-muted block font-mono text-xs">Older</span>
              <span className="font-display text-ink group-hover:text-accent mt-1 block text-lg font-semibold tracking-tight transition-colors">
                {older.title}
              </span>
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}
