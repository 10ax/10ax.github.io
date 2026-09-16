/**
 * Contract tests for the real posts in `content/blog/`.
 *
 * `npm run build` fails outright on a post whose frontmatter cannot be parsed, and
 * degrades quietly on one whose frontmatter is merely wrong — a missing date silently
 * becomes today, a scalar `tags:` value is silently dropped. Both classes of mistake are
 * cheaper to find here than in a deploy log, so this file reads the committed content
 * rather than a fixture.
 *
 * These tests do not assert how many posts exist or what they are called: adding a post
 * is routine and must not turn this file red.
 */
import { describe, expect, it } from "vitest";
import { getAllPosts, type Post } from "@/lib/posts";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const posts: Post[] = await getAllPosts();

describe("content/blog", () => {
  it("parses every committed post without throwing", () => {
    // Reaching this line at all means the top-level `getAllPosts()` resolved.
    expect(posts.length).toBeGreaterThan(0);
  });

  it("gives every post a unique slug", () => {
    const slugs = posts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every post a URL-safe slug", () => {
    for (const post of posts) {
      expect(post.slug, `slug of ${post.slug}`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("gives every post an explicit title rather than one derived from the slug", () => {
    for (const post of posts) {
      expect(post.title.trim(), `title of ${post.slug}`).not.toBe("");
      // A title equal to the slug means the `title:` key was missing or misspelled.
      expect(post.title, `title of ${post.slug}`).not.toBe(post.slug);
    }
  });

  it("gives every post a date that survives the build as YYYY-MM-DD", () => {
    for (const post of posts) {
      expect(post.date, `date of ${post.slug}`).toMatch(ISO_DATE);
      // The sitemap calls `new Date(post.date)`; an unparseable value would be
      // serialised as an Invalid Date and break sitemap.xml generation.
      expect(Number.isNaN(new Date(post.date).getTime()), `date of ${post.slug}`).toBe(false);
    }
  });

  it("gives every post a non-empty body", () => {
    for (const post of posts) {
      expect(post.content.trim().length, `body of ${post.slug}`).toBeGreaterThan(0);
    }
  });

  it("keeps tags, where present, a non-empty array of non-empty strings", () => {
    for (const post of posts.filter((p) => p.tags !== undefined)) {
      expect(post.tags, `tags of ${post.slug}`).not.toHaveLength(0);
      for (const tag of post.tags ?? []) {
        expect(tag.trim(), `tag of ${post.slug}`).not.toBe("");
      }
    }
  });

  it("returns posts newest first", () => {
    const dates = posts.map((p) => p.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });
});
