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

/**
 * Turn one MDX file's raw bytes into a {@link Post}.
 *
 * Pure: the filename supplies the slug, the body supplies everything else. Split out of
 * the filesystem read so the frontmatter rules can be tested directly — see
 * `tests/posts.test.ts`.
 *
 * Lenient by design, with two consequences worth knowing: a missing or non-string `date`
 * silently becomes today, and a `tags:` value that is not a YAML list is silently dropped.
 *
 * @throws when the frontmatter is not valid YAML — which is what fails `npm run build`.
 */
export function parsePost(filename: string, raw: string): Post {
  const slug = filename.replace(/\.mdx?$/, "");
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

async function readPostFile(dir: string, filename: string): Promise<Post> {
  const raw = await fs.readFile(path.join(dir, filename), "utf8");
  return parsePost(filename, raw);
}

/**
 * Read every `.md`/`.mdx` file in `dir`, newest first by frontmatter date.
 *
 * A missing directory yields an empty list; a file with unparseable frontmatter rejects
 * the whole call, and therefore the whole build.
 *
 * @param dir directory to read. Defaults to `content/blog` under `process.cwd()`;
 *   only tests pass anything else.
 */
export async function getAllPosts(dir: string = POSTS_DIR): Promise<Post[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const files = entries.filter((f) => /\.mdx?$/.test(f));
  const posts = await Promise.all(files.map((f) => readPostFile(dir, f)));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Find one post by its slug — the filename without its extension, matched exactly.
 *
 * @param dir directory to read. Defaults to `content/blog` under `process.cwd()`.
 * @returns the post, or `null` when no file matches.
 */
export async function getPostBySlug(slug: string, dir: string = POSTS_DIR): Promise<Post | null> {
  const posts = await getAllPosts(dir);
  return posts.find((p) => p.slug === slug) ?? null;
}
