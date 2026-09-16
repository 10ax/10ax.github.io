/**
 * Characterisation tests for the two metadata routes, `src/app/sitemap.ts` and
 * `src/app/robots.ts`.
 *
 * Both capture `resolveSiteUrl()` into a module-level constant, so the origin they
 * publish is frozen at import time. Each test therefore sets the environment first and
 * imports the module afterwards, via `vi.resetModules()` plus a dynamic import.
 *
 * The sitemap reads the real `content/blog` directory, because `getAllPosts` resolves it
 * from `process.cwd()` and Vitest runs from the repository root. That is deliberate: it
 * makes this file fail if a post is ever added with frontmatter the build cannot parse.
 */
import type { MetadataRoute } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAllPosts } from "@/lib/posts";

const FALLBACK = "https://10ax.github.io";

/** Import `sitemap.ts` fresh, with `NEXT_PUBLIC_SITE_URL` set to `siteUrl`. */
async function loadSitemap(siteUrl?: string): Promise<MetadataRoute.Sitemap> {
  if (siteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  vi.resetModules();
  const mod = await import("@/app/sitemap");
  return mod.default();
}

/** Import `robots.ts` fresh, with `NEXT_PUBLIC_SITE_URL` set to `siteUrl`. */
async function loadRobots(siteUrl?: string): Promise<MetadataRoute.Robots> {
  if (siteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  vi.resetModules();
  const mod = await import("@/app/robots");
  return mod.default();
}

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  vi.resetModules();
});

describe("sitemap", () => {
  it("is marked force-static, as `output: 'export'` requires", async () => {
    vi.resetModules();
    const mod = await import("@/app/sitemap");
    expect(mod.dynamic).toBe("force-static");
  });

  it("lists the five static routes first, in a fixed order", async () => {
    const entries = await loadSitemap(undefined);

    expect(entries.slice(0, 5).map((e) => e.url)).toEqual([
      FALLBACK,
      `${FALLBACK}/blog`,
      `${FALLBACK}/gallery`,
      `${FALLBACK}/music`,
      `${FALLBACK}/homelab`,
    ]);
  });

  it("gives each static route its documented priority and change frequency", async () => {
    const entries = await loadSitemap(undefined);
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    expect(byUrl.get(FALLBACK)).toMatchObject({ changeFrequency: "monthly", priority: 1 });
    expect(byUrl.get(`${FALLBACK}/blog`)).toMatchObject({
      changeFrequency: "weekly",
      priority: 0.8,
    });
    expect(byUrl.get(`${FALLBACK}/gallery`)).toMatchObject({
      changeFrequency: "monthly",
      priority: 0.6,
    });
    expect(byUrl.get(`${FALLBACK}/music`)).toMatchObject({
      changeFrequency: "daily",
      priority: 0.6,
    });
    expect(byUrl.get(`${FALLBACK}/homelab`)).toMatchObject({
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });

  it("appends one entry per blog post, after the static routes", async () => {
    const posts = await getAllPosts();
    const entries = await loadSitemap(undefined);

    expect(entries).toHaveLength(5 + posts.length);
    expect(entries.slice(5).map((e) => e.url)).toEqual(
      posts.map((p) => `${FALLBACK}/blog/${p.slug}`),
    );
    for (const entry of entries.slice(5)) {
      expect(entry).toMatchObject({ changeFrequency: "yearly", priority: 0.7 });
    }
  });

  it("dates each post entry from the post's own frontmatter date", async () => {
    const posts = await getAllPosts();
    const entries = await loadSitemap(undefined);

    for (const [i, post] of posts.entries()) {
      expect(entries[5 + i].lastModified).toEqual(new Date(post.date));
    }
  });

  it("omits the trailing slash that the exported site actually serves (known issue)", async () => {
    // `next.config.ts` sets `trailingSlash: true`, so /blog is served as /blog/.
    // The sitemap advertises the un-slashed form, which Pages answers with a redirect.
    const entries = await loadSitemap(undefined);
    for (const entry of entries) {
      expect(entry.url.endsWith("/")).toBe(false);
    }
  });

  it("builds every URL from NEXT_PUBLIC_SITE_URL when it is set", async () => {
    const entries = await loadSitemap("https://example.com/");
    expect(entries.every((e) => e.url.startsWith("https://example.com"))).toBe(true);
    expect(entries[0].url).toBe("https://example.com");
    expect(entries[1].url).toBe("https://example.com/blog");
  });
});

describe("robots", () => {
  it("is marked force-static, as `output: 'export'` requires", async () => {
    vi.resetModules();
    const mod = await import("@/app/robots");
    expect(mod.dynamic).toBe("force-static");
  });

  it("allows every crawler everywhere and points at the sitemap", async () => {
    await expect(loadRobots(undefined)).resolves.toEqual({
      rules: [{ userAgent: "*", allow: "/" }],
      sitemap: `${FALLBACK}/sitemap.xml`,
      host: FALLBACK,
    });
  });

  it("follows NEXT_PUBLIC_SITE_URL for both the host and the sitemap link", async () => {
    const result = await loadRobots("example.com");
    expect(result.host).toBe("https://example.com");
    expect(result.sitemap).toBe("https://example.com/sitemap.xml");
  });
});
