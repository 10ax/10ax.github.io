/**
 * Characterisation tests for `src/lib/posts.ts`.
 *
 * Every blog route is generated from this module at build time: `generateStaticParams`,
 * `generateMetadata`, the blog index and the sitemap all read it. That makes it the one
 * place in the repo where a bad input turns into a failed deploy rather than a bad pixel,
 * so the parsing rules — including the lenient ones that quietly swallow mistakes — are
 * pinned down here.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAllPosts, getPostBySlug, parsePost } from "@/lib/posts";

/** Today in the same `YYYY-MM-DD` shape `normalizeDate` produces when it gives up. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

describe("parsePost", () => {
  it("reads every supported frontmatter field and keeps the body verbatim", () => {
    const post = parsePost(
      "hello-world.mdx",
      [
        "---",
        "title: Hello World",
        "date: 2026-05-31",
        "description: A first post.",
        "tags: [meta, intro]",
        "---",
        "",
        "Body text.",
        "",
      ].join("\n"),
    );

    expect(post).toEqual({
      slug: "hello-world",
      title: "Hello World",
      date: "2026-05-31",
      description: "A first post.",
      tags: ["meta", "intro"],
      content: "\nBody text.\n",
    });
  });

  it("derives the slug by stripping .mdx", () => {
    expect(parsePost("a-post.mdx", "---\ntitle: T\n---\n").slug).toBe("a-post");
  });

  it("derives the slug by stripping .md", () => {
    expect(parsePost("a-post.md", "---\ntitle: T\n---\n").slug).toBe("a-post");
  });

  it("falls back to the slug when no title is given", () => {
    expect(parsePost("untitled-note.mdx", "---\ndate: 2026-01-01\n---\n").title).toBe(
      "untitled-note",
    );
  });

  it("coerces a non-string title to a string", () => {
    expect(parsePost("n.mdx", "---\ntitle: 2026\n---\n").title).toBe("2026");
  });

  describe("date handling", () => {
    it("formats an unquoted YAML date as UTC YYYY-MM-DD", () => {
      // js-yaml turns `2026-05-31` into a real Date at UTC midnight.
      expect(parsePost("p.mdx", "---\ndate: 2026-05-31\n---\n").date).toBe("2026-05-31");
    });

    it("takes the first ten characters of a quoted string date, unvalidated", () => {
      expect(parsePost("p.mdx", '---\ndate: "2026-05-31T12:00:00Z"\n---\n').date).toBe(
        "2026-05-31",
      );
      // No parsing, no validation — whatever the first ten characters are, that is the date.
      expect(parsePost("p.mdx", '---\ndate: "31/05/2026"\n---\n').date).toBe("31/05/2026");
    });

    it("falls back to today when the date is missing", () => {
      expect(parsePost("p.mdx", "---\ntitle: T\n---\n").date).toBe(todayIso());
    });

    it("falls back to today when the date is a bare number", () => {
      // `date: 2026` is a YAML integer, neither Date nor string, so it is discarded.
      expect(parsePost("p.mdx", "---\ndate: 2026\n---\n").date).toBe(todayIso());
    });

    it("shifts a zone-offset datetime into UTC, which can move the day (known issue)", () => {
      expect(parsePost("p.mdx", "---\ndate: 2026-05-31 23:00:00 -05:00\n---\n").date).toBe(
        "2026-06-01",
      );
    });
  });

  describe("optional fields", () => {
    it("leaves description undefined when absent", () => {
      expect(parsePost("p.mdx", "---\ntitle: T\n---\n").description).toBeUndefined();
    });

    it("treats an empty description as absent", () => {
      expect(parsePost("p.mdx", '---\ndescription: ""\n---\n').description).toBeUndefined();
    });

    it("leaves tags undefined when absent", () => {
      expect(parsePost("p.mdx", "---\ntitle: T\n---\n").tags).toBeUndefined();
    });

    it("drops a scalar tags value instead of wrapping it (known issue)", () => {
      expect(parsePost("p.mdx", "---\ntags: meta\n---\n").tags).toBeUndefined();
    });

    it("stringifies non-string entries in a tags array", () => {
      expect(parsePost("p.mdx", "---\ntags: [meta, 42]\n---\n").tags).toEqual(["meta", "42"]);
    });
  });

  it("accepts a file with no frontmatter at all", () => {
    const post = parsePost("bare.mdx", "Just a body.\n");
    expect(post.title).toBe("bare");
    expect(post.date).toBe(todayIso());
    expect(post.content).toBe("Just a body.\n");
  });

  it("throws on malformed YAML frontmatter", () => {
    // This is the failure that breaks `npm run build`; see docs/TROUBLESHOOTING.md.
    expect(() => parsePost("broken.mdx", "---\ntitle: [unclosed\n---\nbody\n")).toThrow();
  });

  it("throws only on the first parse of a given body, then returns it empty", () => {
    // gray-matter memoises by content string, and a parse that throws leaves an
    // unparsed entry behind. Re-parsing the identical bytes in the same process
    // therefore yields empty frontmatter instead of throwing again. Harmless in a
    // build (each file is parsed once before the failure aborts it), but it means
    // two tests must never share a malformed fixture.
    const body = "---\ntitle: {also broken\n---\nbody\n";
    expect(() => parsePost("first.mdx", body)).toThrow();
    expect(parsePost("second.mdx", body)).toMatchObject({
      slug: "second",
      title: "second",
      tags: undefined,
    });
  });
});

describe("getAllPosts", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "posts-test-"));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  async function write(name: string, body: string): Promise<void> {
    await fs.writeFile(path.join(dir, name), body, "utf8");
  }

  it("returns an empty list when the directory does not exist", async () => {
    await expect(getAllPosts(path.join(dir, "nope"))).resolves.toEqual([]);
  });

  it("returns an empty list for an empty directory", async () => {
    await expect(getAllPosts(dir)).resolves.toEqual([]);
  });

  it("sorts newest first by the date string", async () => {
    await write("old.mdx", "---\ntitle: Old\ndate: 2024-01-01\n---\n");
    await write("new.mdx", "---\ntitle: New\ndate: 2026-09-01\n---\n");
    await write("mid.mdx", "---\ntitle: Mid\ndate: 2025-06-15\n---\n");

    const posts = await getAllPosts(dir);
    expect(posts.map((p) => p.slug)).toEqual(["new", "mid", "old"]);
  });

  it("reads .md as well as .mdx and ignores every other extension", async () => {
    await write("a.mdx", "---\ntitle: A\ndate: 2026-03-03\n---\n");
    await write("b.md", "---\ntitle: B\ndate: 2026-02-02\n---\n");
    await write("draft.txt", "---\ntitle: Draft\ndate: 2026-01-01\n---\n");
    await write("README", "not a post");

    const posts = await getAllPosts(dir);
    expect(posts.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("rejects when any single post has malformed frontmatter", async () => {
    await write("good.mdx", "---\ntitle: Good\ndate: 2026-01-01\n---\n");
    // Unique to this test: gray-matter memoises by content string, so a body already
    // parsed elsewhere in this file would come back empty instead of throwing.
    await write("bad.mdx", '---\ntitle: "unterminated\ndate: 2026-01-01\n---\nbody\n');

    // One bad file fails the whole read — and therefore the whole build.
    await expect(getAllPosts(dir)).rejects.toThrow();
  });
});

describe("getPostBySlug", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "posts-slug-test-"));
    await fs.writeFile(
      path.join(dir, "findable.mdx"),
      "---\ntitle: Findable\ndate: 2026-04-04\n---\n\nBody.\n",
      "utf8",
    );
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("returns the matching post", async () => {
    const post = await getPostBySlug("findable", dir);
    expect(post?.title).toBe("Findable");
    expect(post?.content).toBe("\nBody.\n");
  });

  it("returns null for an unknown slug", async () => {
    await expect(getPostBySlug("missing", dir)).resolves.toBeNull();
  });

  it("matches the slug exactly, with no extension and no case folding", async () => {
    await expect(getPostBySlug("findable.mdx", dir)).resolves.toBeNull();
    await expect(getPostBySlug("Findable", dir)).resolves.toBeNull();
  });
});
