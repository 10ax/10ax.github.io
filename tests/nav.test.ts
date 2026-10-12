/**
 * Characterisation tests for the one place nav labels and hrefs are declared.
 *
 * The five original labels are byte-identical by contract, because they are the site's
 * muscle memory and its crawl surface. `CV` is the single addition.
 */
import { describe, expect, it } from "vitest";
import { CONTACT_LABEL, NAV_LINKS, isActiveHref } from "@/lib/nav";

describe("NAV_LINKS", () => {
  it("keeps the five original labels byte-identical, in order", () => {
    expect(NAV_LINKS.map((l) => l.label)).toEqual([
      "Home",
      "CV",
      "Blog",
      "Gallery",
      "Music",
      "Homelab",
    ]);
  });

  it("points every entry at a real route", () => {
    expect(NAV_LINKS.map((l) => l.href)).toEqual([
      "/",
      "/cv",
      "/blog",
      "/gallery",
      "/music",
      "/homelab",
    ]);
  });

  it("has no duplicate hrefs or labels", () => {
    expect(new Set(NAV_LINKS.map((l) => l.href)).size).toBe(NAV_LINKS.length);
    expect(new Set(NAV_LINKS.map((l) => l.label)).size).toBe(NAV_LINKS.length);
  });
});

describe("isActiveHref", () => {
  it("matches the home link only on the home path", () => {
    expect(isActiveHref("/", "/")).toBe(true);
    expect(isActiveHref("/blog", "/")).toBe(false);
    expect(isActiveHref("/blog/welcome", "/")).toBe(false);
  });

  it("treats a nested path as belonging to its section", () => {
    expect(isActiveHref("/blog/welcome", "/blog")).toBe(true);
    expect(isActiveHref("/blog", "/blog")).toBe(true);
  });

  it("does not match a section by prefix alone", () => {
    expect(isActiveHref("/blogging", "/blog")).toBe(false);
    expect(isActiveHref("/musicology", "/music")).toBe(false);
  });

  it("tolerates the trailing slash the exported site actually serves", () => {
    expect(isActiveHref("/blog/", "/blog")).toBe(true);
    expect(isActiveHref("/", "/")).toBe(true);
  });
});

describe("CONTACT_LABEL", () => {
  it("is the only contact-intent label in the app", () => {
    expect(CONTACT_LABEL).toBe("Get in touch");
  });
});
