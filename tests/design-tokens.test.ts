/**
 * Characterisation tests for the token layer in `src/app/globals.css`.
 *
 * The token block is the one file where raw hex values are allowed, so it is read as
 * text and checked directly. The parity test is the point of this file: a token defined
 * in one theme and forgotten in the other is the failure this redesign can actually ship,
 * because nothing else in the suite renders CSS.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");

/** Pull the custom-property names out of a `selector { ... }` block. */
function tokenNames(selector: string): string[] {
  const start = css.indexOf(selector);
  if (start === -1) return [];
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return [...css.slice(open, close).matchAll(/(--[a-z-]+)\s*:/g)].map((m) => m[1]);
}

describe("design tokens", () => {
  it("defines a dark theme block and a light theme block", () => {
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-theme="light"]');
  });

  it("defines the same colour tokens in both themes", () => {
    const dark = new Set(tokenNames('[data-theme="dark"]'));
    const light = new Set(tokenNames('[data-theme="light"]'));
    const colourish = (n: string) => !n.startsWith("--font-") && !n.startsWith("--radius-");
    const darkOnly = [...dark].filter((n) => colourish(n) && !light.has(n));
    const lightOnly = [...light].filter((n) => colourish(n) && !dark.has(n));
    expect(darkOnly).toEqual([]);
    expect(lightOnly).toEqual([]);
  });

  it("exposes every colour token to Tailwind through @theme inline", () => {
    for (const token of [
      "--surface",
      "--panel",
      "--sunken",
      "--line",
      "--line-strong",
      "--ink",
      "--ink-muted",
      "--accent",
      "--accent-ink",
      "--star",
    ]) {
      expect(css).toContain(`--color-${token.slice(2)}: var(${token})`);
    }
  });

  it("never uses pure black or pure white as a surface", () => {
    expect(css).not.toMatch(/#000000|#000\b|#ffffff|#fff\b/i);
  });

  it("defaults to the system colour scheme before the script runs", () => {
    expect(css).toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
  });

  it("disables smooth scrolling when reduced motion is requested", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});
