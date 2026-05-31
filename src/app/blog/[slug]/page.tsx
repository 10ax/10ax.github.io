import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
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
    title: `${post.title} — Blog`,
    description: post.description,
  };
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-8 text-3xl font-bold tracking-tight text-white" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-8 text-2xl font-semibold tracking-tight text-white" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-6 text-xl font-semibold text-slate-100" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-4 leading-relaxed text-slate-300" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-emerald-400 underline-offset-4 hover:underline" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-4 list-disc space-y-1 pl-6 text-slate-300" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-4 list-decimal space-y-1 pl-6 text-slate-300" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { "data-language"?: string }) => {
    // `rehype-pretty-code` adds `data-language` to highlighted blocks; leave those untouched.
    if (props["data-language"]) return <code {...props} />;
    return (
      <code
        className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-sm text-emerald-300"
        {...props}
      />
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={[
        "mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 py-4 text-sm leading-relaxed",
        // strip inner code styling
        "[&_code]:bg-transparent [&_code]:p-0 [&_code]:text-slate-200",
        // each rehype-pretty-code line is a span with data-line; turn them into block rows with horizontal padding
        "[&_code>span[data-line]]:block [&_code>span[data-line]]:px-4",
        // full-line highlight (```ts {1,3-5})
        "[&_code>span[data-highlighted-line]]:bg-emerald-500/10",
        "[&_code>span[data-highlighted-line]]:border-l-2 [&_code>span[data-highlighted-line]]:border-emerald-400",
        "[&_code>span[data-highlighted-line]]:pl-[14px]",
        // inline word/char highlight (```ts /word/)
        "[&_mark[data-highlighted-chars]]:bg-emerald-500/20 [&_mark[data-highlighted-chars]]:text-emerald-200",
        "[&_mark[data-highlighted-chars]]:rounded [&_mark[data-highlighted-chars]]:px-1",
        // line numbers (only when showLineNumbers is set on the code fence)
        "[&[data-line-numbers]_code]:[counter-reset:line]",
        "[&[data-line-numbers]_code>span[data-line]]:before:[content:counter(line)]",
        "[&[data-line-numbers]_code>span[data-line]]:before:[counter-increment:line]",
        "[&[data-line-numbers]_code>span[data-line]]:before:mr-4 [&[data-line-numbers]_code>span[data-line]]:before:inline-block",
        "[&[data-line-numbers]_code>span[data-line]]:before:w-6 [&[data-line-numbers]_code>span[data-line]]:before:text-right",
        "[&[data-line-numbers]_code>span[data-line]]:before:text-slate-600 [&[data-line-numbers]_code>span[data-line]]:before:tabular-nums",
      ].join(" ")}
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-slate-100" {...props} />
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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>
      <article className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          {post.tags?.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5 font-mono text-[10px] text-slate-300"
            >
              <Tag className="h-3 w-3" />
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-3 text-lg text-slate-400">{post.description}</p>
        )}
        <div className="mt-8 border-t border-slate-800 pt-6">
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
    </main>
  );
}
