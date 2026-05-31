import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
};

export type Post = PostFrontmatter & {
  slug: string;
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

function normalizeDate(raw: unknown): string {
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === "string") return raw.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

async function readPostFile(filename: string): Promise<Post> {
  const slug = filename.replace(/\.mdx?$/, "");
  const raw = await fs.readFile(path.join(POSTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    date: normalizeDate(data.date),
    description: data.description ? String(data.description) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    content,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(POSTS_DIR);
  } catch {
    return [];
  }
  const files = entries.filter((f) => /\.mdx?$/.test(f));
  const posts = await Promise.all(files.map(readPostFile));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
