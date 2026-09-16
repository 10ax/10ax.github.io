/**
 * Characterisation tests for `src/lib/site-url.ts`.
 *
 * `resolveSiteUrl` decides the absolute origin that ends up in `metadataBase`,
 * OpenGraph URLs, `sitemap.xml` and `robots.txt`. Getting it wrong does not break
 * the build — it silently ships a site full of links pointing at the wrong host —
 * so the exact normalisation rules are pinned down here.
 */
import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrlObject, resolveSiteUrl } from "@/lib/site-url";

const FALLBACK = "https://10ax.github.io";

describe("resolveSiteUrl", () => {
  describe("falls back when there is nothing usable", () => {
    it("returns the hard-coded Pages origin for an undefined value", () => {
      expect(resolveSiteUrl(undefined)).toBe(FALLBACK);
    });

    it("returns the fallback for an empty string", () => {
      expect(resolveSiteUrl("")).toBe(FALLBACK);
    });

    it("returns the fallback for whitespace only", () => {
      expect(resolveSiteUrl("   ")).toBe(FALLBACK);
    });

    it("returns the fallback for a value the URL parser rejects", () => {
      expect(resolveSiteUrl("not a url")).toBe(FALLBACK);
      expect(resolveSiteUrl("http://")).toBe(FALLBACK);
    });
  });

  describe("normalises a usable value", () => {
    it("keeps an already-absolute https origin", () => {
      expect(resolveSiteUrl("https://example.com")).toBe("https://example.com");
    });

    it("adds https:// to a bare host", () => {
      expect(resolveSiteUrl("example.com")).toBe("https://example.com");
    });

    it("keeps an explicit http scheme and port", () => {
      expect(resolveSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
    });

    it("strips exactly one trailing slash from an origin", () => {
      expect(resolveSiteUrl("https://10ax.github.io/")).toBe(FALLBACK);
    });

    it("strips a trailing slash from a path prefix but keeps the path", () => {
      expect(resolveSiteUrl("https://10ax.github.io/portfolio/")).toBe(
        "https://10ax.github.io/portfolio",
      );
      expect(resolveSiteUrl("https://10ax.github.io/portfolio")).toBe(
        "https://10ax.github.io/portfolio",
      );
    });

    it("adds https:// to a bare host that already carries a path prefix", () => {
      expect(resolveSiteUrl("10ax.github.io/portfolio")).toBe(
        "https://10ax.github.io/portfolio",
      );
    });

    it("trims surrounding whitespace before parsing", () => {
      expect(resolveSiteUrl("  https://example.com  ")).toBe("https://example.com");
    });

    it("lower-cases the scheme and host, as the URL parser does", () => {
      expect(resolveSiteUrl("HTTPS://Example.COM")).toBe("https://example.com");
    });
  });

  // Documented in docs/TROUBLESHOOTING.md under "Known issues". The test pins the
  // current (wrong) output rather than the desired one, so that fixing it is a
  // visible, deliberate change rather than a silent one.
  it("mangles a non-http(s) scheme instead of rejecting it (known issue)", () => {
    expect(resolveSiteUrl("ftp://x.com")).toBe("https://ftp//x.com");
  });
});

describe("getSiteUrlObject", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("reads NEXT_PUBLIC_SITE_URL at call time, not at import time", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://first.example";
    expect(getSiteUrlObject().href).toBe("https://first.example/");

    process.env.NEXT_PUBLIC_SITE_URL = "https://second.example";
    expect(getSiteUrlObject().href).toBe("https://second.example/");
  });

  it("returns a URL built from the fallback when the variable is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const url = getSiteUrlObject();
    expect(url).toBeInstanceOf(URL);
    expect(url.origin).toBe(FALLBACK);
    // `new URL("https://10ax.github.io")` re-adds the root path that
    // `resolveSiteUrl` just stripped.
    expect(url.href).toBe(`${FALLBACK}/`);
  });
});
