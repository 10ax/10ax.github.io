import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — Francesco Tenace",
  description: "Notes on engineering, homelab tinkering, and other interests.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <>
      <PageHeader
        eyebrow="cat ~/blog"
        title="Blog"
        description="Notes on engineering, homelab tinkering, and other interests."
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-400">No posts yet. Check back soon.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
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
                  <h2 className="text-lg font-semibold text-slate-100 group-hover:text-emerald-300">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
