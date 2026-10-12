# Home Hub Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CV-style home page with a personal hub (scene hero, code-authored pixel sprite, interests, destinations), move the CV to a new `/cv` route, and rebuild the whole visual system on a light/dark token layer.

**Architecture:** Tailwind v4 with a CSS-variable token layer mapped through `@theme inline`, so every colour, radius and font is a token read by utilities and swapped wholesale per theme. All motion lives in isolated `"use client"` leaves using `motion/react`, gated by `prefers-reduced-motion`. The sprite is authored as text pixel grids in `src/sprites/`, compiled to integer-scale PNGs by a dependency-free Node script (`node:zlib` plus a hand-written CRC32), and animated with CSS `steps()`.

**Tech Stack:** Next.js 16.2.6 App Router (`output: "export"`, `trailingSlash: true`), React 19.2.4, TypeScript 5 strict, Tailwind CSS v4 via `@tailwindcss/postcss`, `motion`, `@phosphor-icons/react`, `next/font/google` (Geist, Archivo, Silkscreen), Vitest 3 (node environment, no DOM).

**Spec:** `docs/redesign/2026-10-12-home-hub-redesign-design.md` — the plan argues from the spec, so read both. Where this plan refines the spec, section "Spec refinements" below says exactly how and why.

## Global Constraints

Copied verbatim from the spec and the repo's documented invariants. Every task's requirements implicitly include this section.

- `output: "export"` is not negotiable. No route handlers, no server actions, no middleware, no `next/image` optimiser, no ISR, no `dynamic = "force-dynamic"`.
- Every metadata route (`sitemap.ts`, `robots.ts`, all four `opengraph-image.tsx`) keeps `export const dynamic = "force-static"`.
- The build must succeed with **no environment variables set**, exactly as CI runs it.
- Only read-only public values carry `NEXT_PUBLIC_`. The Last.fm shared secret never appears.
- `deploy.yml`, `AGENTS.md`, `DEPLOY.md`, the first line of `CLAUDE.md`, and `public/.nojekyll` are not touched.
- Generated prose in `README.md` and `CLAUDE.md` stays strictly between `<!-- autodoc:begin -->` and `<!-- autodoc:end -->`. Nothing outside that pair is edited.
- The repo stays named `10ax.github.io`. No `basePath`, no `assetPrefix`.
- Page slugs are unchanged and the five existing nav labels stay byte-identical (`Home`, `Blog`, `Gallery`, `Music`, `Homelab`). Exactly one label is added: `CV`.
- Commands, in this order, all pass before any commit: `pnpm run lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run build`.
- No `window.addEventListener("scroll")` anywhere. Only `transform` and `opacity` animate.
- No `—` or `–` in any user-visible string, including `metadata.title`. Titles use `|`. Em-dashes inside code comments and JSDoc are not user-visible and are not churned.
- The prose of the three published posts in `content/blog/` is not edited.
- CV facts are byte-identical: job titles, employers, dates, tech lists, contact details, education, languages, hobbies.
- Tests stay pure Node logic. No DOM environment, no component tests, no testing-library. This matches `vitest.config.mts` and the "no component tests" statement in `README.md`.
- Every colour value in a component comes from a token utility. No hardcoded hex in `src/components/**` or `src/app/**` except `src/app/globals.css` and `src/sprites/**`.

## Review Focus

Inputs and conditions the spec implies but no test exercises directly. Each line names the behaviour a reasonable person expects, and the task that owns its test.

1. **A theme is chosen before paint on a cold load.** Expectation: no flash of the wrong theme on a first visit with `prefers-color-scheme: dark` or with a stored `light`. Test: Task 2.
2. **A URL that does not exist.** Expectation: the branded 404 renders, not Next's default, and it links home and to `/blog`. Verification: Tasks 6 and 24 (no DOM test environment exists, so this is checked by opening the exported page).
3. **A malformed or half-authored sprite grid.** Expectation: a bad grid fails a test instead of shipping a broken PNG. Test: Task 9.
4. **Reduced motion, at every animated moment.** Expectation: nothing moves, and every piece of content is still readable and reachable. Verification: Task 24, plus a reduced-motion assertion in Tasks 7, 8, 12 and 13.
5. **The CV surface after the move.** Expectation: every CV fact on `/cv` is identical to the old home page, and the `Person` JSON-LD still describes the same person. Tests: Tasks 16 and 17.

## Spec refinements

Three deliberate, small departures from the spec. Each is visible here so a reviewer can reject it.

1. **Sprite cell is 16x24, not 32x32 (spec 5.1).** Reason: pixel-exact authoring in a text grid is tractable and reviewable at 16x24, and rendered at 4x integer scale it is 64x96, which is the right size for the scene. The contract's essentials are unchanged: integer scale only, `image-rendering: pixelated`, fixed rows `idle`/`walk`/`interact`, a static frame under reduced motion.
2. **Two authored frames, eight sheet cells (spec 5.1).** Reason: the sheet keeps eight cells in the fixed row order, but `walk` and `interact` cells are derived from the two authored frames plus documented `dx`/`dy` offsets, which is how small GBA sprites actually animate. This keeps the art reviewable without hand-drawing eight frames.
3. **The sprite sheet ships as per-state horizontal strips (spec 5.1, 6.1).** Reason: a strip is what CSS `steps()` animates directly with `background-position`, and it removes any slicing logic from the component.

## File Structure

Created:

- `src/lib/theme.ts` — theme type, storage key, pre-paint script string
- `src/lib/nav.ts` — the six nav links and active-href logic, single source of truth
- `src/lib/cv-data.ts` — the CV facts, moved out of the home page, typed
- `src/components/theme-toggle.tsx` — client toggle
- `src/components/skip-link.tsx`
- `src/components/pixel-label.tsx` — the Silkscreen micro-label
- `src/components/reveal.tsx` — the shared `whileInView` wrapper
- `src/components/spotlight-card.tsx` — cursor-tracking border
- `src/components/magnetic-cta.tsx`
- `src/components/reading-progress.tsx`
- `src/components/lightbox.tsx`
- `src/components/scene/starfield.tsx`
- `src/components/scene/sprite.tsx`
- `src/components/scene/hub-menu.tsx`
- `src/sprites/trainer.ts` — palette, two frames, state definitions
- `src/sprites/sheet.ts` — pure sheet types and grid validation helpers
- `scripts/build-sprite.mjs` — grid to PNG compiler and writer
- `src/app/cv/page.tsx`
- `src/app/not-found.tsx`

Modified:

- `src/app/globals.css` — token layer, pixel utilities, grain, focus rings
- `src/app/layout.tsx` — fonts, pre-paint script, skip link, view transition wrappers
- `src/components/site-header.tsx` — nav from `src/lib/nav.ts`, active state, toggle, drawer
- `src/components/site-footer.tsx` — token colours, one contact label, real links
- `src/components/page-header.tsx` — token-driven, no mandatory mono eyebrow
- `src/app/page.tsx` — becomes the hub
- `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/gallery/page.tsx`, `src/app/music/page.tsx`, `src/app/homelab/page.tsx`
- `src/components/track-list.tsx` — skeleton loader
- `src/app/sitemap.ts` — adds `/cv`
- `next.config.ts` — view transitions flag, only if Task 23's verification passes
- `package.json` — the sprite build script

Tests created: `tests/design-tokens.test.ts`, `tests/theme.test.ts`, `tests/nav.test.ts`, `tests/icons.test.ts`, `tests/sprite-sheet.test.ts`, `tests/png.test.ts`, `tests/cv-data.test.ts`.

Tests modified: `tests/metadata-routes.test.ts` (six static routes).

---

### Task 1: Token layer and fonts

**Files:**
- Modify: `src/app/globals.css` (full rewrite, 26 lines today)
- Modify: `src/app/layout.tsx:1-23` (font wiring) and `:55-58` (body classes)
- Test: `tests/design-tokens.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: token utilities used by every later task: `bg-surface`, `bg-panel`, `bg-sunken`, `border-line`, `border-line-strong`, `text-ink`, `text-ink-muted`, `bg-accent`, `text-accent-ink`, `text-star`, `font-display`, `font-sans`, `font-mono`, `font-pixel`, `rounded-panel`, `rounded-chip`, and the CSS classes `.pixel-panel`, `.grain`, `.focus-ring`. Font CSS variables: `--font-geist-sans`, `--font-geist-mono`, `--font-archivo`, `--font-silkscreen`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/design-tokens.test.ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/design-tokens.test.ts`
Expected: FAIL, the first assertion (`defines a dark theme block`) cannot find `[data-theme="dark"]`.

- [ ] **Step 3: Write the token layer**

Replace the whole of `src/app/globals.css` with:

```css
@import "tailwindcss";

/*
 * Token layer. This is the only file where raw colour values are allowed: every
 * component reads a token utility, so a theme swap is a value change here and nowhere
 * else. Both theme blocks must define the same names - `tests/design-tokens.test.ts`
 * fails on a token that exists in one theme and is forgotten in the other.
 */

:root {
  color-scheme: light;
  --surface: #f7f7f5;
  --panel: #fdfcfa;
  --sunken: #eaeae4;
  --line: rgb(8 9 11 / 0.1);
  --line-strong: rgb(8 9 11 / 0.18);
  --ink: #14161a;
  --ink-muted: #5b626b;
  --accent: #106b50;
  --accent-ink: #fdfcfa;
  --star: rgb(8 9 11 / 0.55);
}

/* Order matters: this block must come BEFORE the `[data-theme]` blocks below.
   `:root` and `[data-theme="..."]` both have specificity (0,1,0), so whichever comes
   last in source wins. The system preference is only the fallback for a visitor who has
   not chosen; an explicit `data-theme` set by the toggle must beat it. With this block
   first, `[data-theme="light"]` wins on a system-dark machine, which is the whole point
   of the toggle. */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --surface: #08090b;
    --panel: #0f1116;
    --sunken: #050608;
    --line: rgb(255 255 255 / 0.08);
    --line-strong: rgb(255 255 255 / 0.16);
    --ink: #e8eaed;
    --ink-muted: #8b929c;
    --accent: #3fbf94;
    --accent-ink: #04231a;
    --star: rgb(255 255 255 / 0.85);
  }
}

[data-theme="light"] {
  color-scheme: light;
  --surface: #f7f7f5;
  --panel: #fdfcfa;
  --sunken: #eaeae4;
  --line: rgb(8 9 11 / 0.1);
  --line-strong: rgb(8 9 11 / 0.18);
  --ink: #14161a;
  --ink-muted: #5b626b;
  --accent: #106b50;
  --accent-ink: #fdfcfa;
  --star: rgb(8 9 11 / 0.55);
}

[data-theme="dark"] {
  color-scheme: dark;
  --surface: #08090b;
  --panel: #0f1116;
  --sunken: #050608;
  --line: rgb(255 255 255 / 0.08);
  --line-strong: rgb(255 255 255 / 0.16);
  --ink: #e8eaed;
  --ink-muted: #8b929c;
  --accent: #3fbf94;
  --accent-ink: #04231a;
  --star: rgb(255 255 255 / 0.85);
}

@theme inline {
  --color-surface: var(--surface);
  --color-panel: var(--panel);
  --color-sunken: var(--sunken);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --color-star: var(--star);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-archivo);
  --font-pixel: var(--font-silkscreen);

  --radius-panel: 16px;
  --radius-chip: 8px;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
}

/*
 * Shape language. Panels are 16px, chips and inputs 8px, interactive elements are
 * pills. Pixel panels notched their corners and take a 2px border, which is the 8-bit
 * accent; they are never used for body content.
 */
.pixel-panel {
  border: 2px solid var(--line-strong);
  border-radius: 0;
  clip-path: polygon(
    6px 0, calc(100% - 6px) 0, calc(100% - 6px) 6px, 100% 6px,
    100% calc(100% - 6px), calc(100% - 6px) calc(100% - 6px),
    calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 6px), 0 calc(100% - 6px),
    0 6px, 6px 6px
  );
}

/* One fixed noise layer, never on a scrolling container. */
.grain {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
}

.focus-ring:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.tabular {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/design-tokens.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Wire the fonts and the body in `src/app/layout.tsx`**

Replace the imports and font declarations at the top of `layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteUrlObject } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Display face. The `wdth` axis is what lets headlines tighten without a second family.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  axes: ["wdth"],
});

// Micro-labels only, never body copy.
const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});
```

Change the `viewport` export to theme-aware values:

```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
  width: "device-width",
  initialScale: 1,
};
```

Change the `<html>` and `<body>` elements:

```tsx
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${silkscreen.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="bg-surface text-ink flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <div className="grain" aria-hidden="true" />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
```

Then fix the two em-dash separators in this file's metadata, because the title is the most visible string on the site and `—` is banned:

```tsx
  title: "Francesco Tenace | Full-stack developer",
```

```tsx
  openGraph: {
    title: "Francesco Tenace | Full-stack developer",
```

And the one in `src/app/opengraph-image.tsx`:

```tsx
export const alt = "Francesco Tenace | Full-stack developer";
```

These three are the only `—` characters left in `src/app` and `src/components` after Tasks 18 to 22 rewrite the four sub-page titles.

- [ ] **Step 6: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass. `pnpm run build` may fail on the next/font network fetch if the sandbox is offline; if so, re-run once and report the failure rather than skipping the command.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx tests/design-tokens.test.ts
git commit -m "refactor(design): add the light/dark token layer and the display faces"
```

---

### Task 2: Theme selection before paint

**Files:**
- Create: `src/lib/theme.ts`
- Create: `src/components/theme-toggle.tsx`
- Modify: `src/app/layout.tsx` (inline script in `<head>`)
- Test: `tests/theme.test.ts` (create)

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: `type Theme = "dark" | "light"`, `THEME_STORAGE_KEY = "ft-theme"`, `THEME_ATTRIBUTE = "data-theme"`, `themeInitScript(): string`, `resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme`, and the `<ThemeToggle />` client component with no props.

- [ ] **Step 1: Write the failing test**

```ts
// tests/theme.test.ts
/**
 * Characterisation tests for the pre-paint theme script and its resolver.
 *
 * The script runs before React and before any stylesheet-dependent layout, so it has to
 * be a fixed string: anything interpolated into it is a value that can only be checked at
 * runtime, on the one code path that must never throw.
 */
import { describe, expect, it } from "vitest";
import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  resolveTheme,
  themeInitScript,
} from "@/lib/theme";

describe("themeInitScript", () => {
  const script = themeInitScript();

  it("is a fixed string with nothing interpolated into it", () => {
    expect(script).not.toContain("${");
    expect(script).not.toContain("undefined");
  });

  it("reads the same storage key and attribute the rest of the app uses", () => {
    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain(`dataset.${THEME_ATTRIBUTE.replace("data-", "")}`);
  });

  it("defaults to dark when storage is unavailable", () => {
    expect(script).toContain("catch");
    expect(script).toContain('"dark"');
  });

  it("is safe to inline as the only statement in a script element", () => {
    expect(script.trimStart().startsWith("(")).toBe(true);
    expect(script.trimEnd().endsWith(")")).toBe(true);
  });
});

describe("resolveTheme", () => {
  it("prefers a stored choice over the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignores a stored value that is not a theme", () => {
    expect(resolveTheme("blue", false)).toBe("light");
    expect(resolveTheme("", true)).toBe("dark");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/theme.test.ts`
Expected: FAIL with a resolution error for `@/lib/theme`.

- [ ] **Step 3: Write `src/lib/theme.ts`**

```ts
export type Theme = "dark" | "light";

/** The localStorage key the toggle writes and the pre-paint script reads. */
export const THEME_STORAGE_KEY = "ft-theme";

/** The attribute the pre-paint script sets and the CSS blocks key off. */
export const THEME_ATTRIBUTE = "data-theme";

/** Pick the stored theme when it is valid, otherwise the system preference. */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  if (stored === "dark" || stored === "light") return stored;
  return systemPrefersDark ? "dark" : "light";
}

/**
 * The script that runs before paint.
 *
 * It has to be a fixed string, not a template: it is the one code path that runs before
 * React exists, and a throw here leaves the page in the wrong theme with no recovery.
 * It therefore wraps everything in try/catch and falls back to `dark`, which is the
 * designed surface. `tests/theme.test.ts` pins those properties.
 */
export function themeInitScript(): string {
  return '(function(){try{var k="ft-theme";var s=localStorage.getItem(k);var t=(s==="dark"||s==="light")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})()';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/theme.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Add the script to `layout.tsx`**

Insert as the first child of `<head>`. `layout.tsx` does not currently declare `<head>`, so add it around the html/body as shown:

```tsx
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${silkscreen.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before paint so the first frame is already the right theme. Fixed string,
          no interpolation: see `themeInitScript` for why.
          eslint-disable-next-line react/no-danger -- script text, not user input
        */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript() }}
        />
      </head>
      <body
        className="bg-surface text-ink flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
```

Add the import:

```tsx
import { themeInitScript } from "@/lib/theme";
```

- [ ] **Step 6: Write `src/components/theme-toggle.tsx`**

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { resolveTheme, THEME_ATTRIBUTE, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * The toggle reads the attribute the pre-paint script already set, so it never disagrees
 * with the first painted frame. It is a client leaf with no props: nothing above it needs
 * to know the theme.
 *
 * The theme lives in a DOM attribute, which is an external store, so it is read with
 * `useSyncExternalStore` rather than copied into state from an effect. Copying it in an
 * effect would trip this repo's `react-hooks/set-state-in-effect` lint rule and would make
 * the server render emit an icon it might not mean. `getServerSnapshot` returning `null`
 * keeps the server markup icon-free, and the MutationObserver keeps the button honest if
 * the attribute is changed by anything else.
 */

function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [THEME_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return resolveTheme(
    document.documentElement.getAttribute(THEME_ATTRIBUTE),
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

function getServerSnapshot(): null {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute(THEME_ATTRIBUTE, next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode and blocked storage: the attribute still applies for this session.
    }
  }

  const label = theme === null ? "Switch theme" : `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="focus-ring text-ink-muted inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:text-ink"
    >
      {/* Rendered only after mount, so the server and client markup cannot disagree. */}
      {theme === null ? null : theme === "dark" ? (
        <Sun size={18} weight="regular" aria-hidden />
      ) : (
        <Moon size={18} weight="regular" aria-hidden />
      )}
    </button>
  );
}
```

- [ ] **Step 7: Mount the toggle in the header**

This step needs the header, which Task 3 rebuilds. Add the import and render `<ThemeToggle />` at the end of the header's flex row now; Task 3 keeps it in place:

```tsx
import { ThemeToggle } from "@/components/theme-toggle";
```

```tsx
        <nav>
          {/* Task 3 replaces this list with `NAV_LINKS` from `src/lib/nav.ts`. */}
          <ul className="flex flex-wrap items-center gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-ring rounded-md px-3 py-1.5 text-ink-muted transition-colors hover:bg-panel hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
```

- [ ] **Step 8: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass.

- [ ] **Step 9: Commit**

```bash
git add src/lib/theme.ts src/components/theme-toggle.tsx src/app/layout.tsx tests/theme.test.ts
git commit -m "feat(theme): resolve and apply the theme before paint"
```

---

### Task 3: Navigation as a single source of truth

**Files:**
- Create: `src/lib/nav.ts`
- Modify: `src/components/site-header.tsx` (full rewrite, 38 lines today)
- Modify: `src/components/site-footer.tsx` (full rewrite, 29 lines today)
- Test: `tests/nav.test.ts` (create)

**Interfaces:**
- Consumes: tokens from Task 1, `<ThemeToggle />` from Task 2.
- Produces: `type NavLink = { href: string; label: string }`, `NAV_LINKS: readonly NavLink[]` (six entries, in order), `isActiveHref(pathname: string, href: string): boolean`, `CONTACT_LABEL = "Get in touch"`, and `<SiteHeader />` / `<SiteFooter />` with no props. Later tasks read `NAV_LINKS` and `CONTACT_LABEL`; no other task re-declares nav labels.

- [ ] **Step 1: Write the failing test**

```ts
// tests/nav.test.ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/nav.test.ts`
Expected: FAIL with a resolution error for `@/lib/nav`.

- [ ] **Step 3: Write `src/lib/nav.ts`**

```ts
export type NavLink = { href: string; label: string };

/**
 * The site's navigation, in order. `CV` is the one addition the redesign makes; the other
 * five labels are byte-identical to what the site shipped before, because they are the
 * crawl surface and the owner's muscle memory.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/cv", label: "CV" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/music", label: "Music" },
  { href: "/homelab", label: "Homelab" },
] as const;

/**
 * The single contact-intent label. One label per intent: this string is the only
 * contact call to action on the site, and it is reused verbatim wherever contact appears.
 */
export const CONTACT_LABEL = "Get in touch";

/**
 * Whether `href` is the current section for `pathname`.
 *
 * Home matches only the exact home path. Every other link matches its own path and any
 * nested path under it (`/blog/welcome` belongs to `/blog`), but not a path that merely
 * starts with the same letters (`/blogging` is not `/blog`).
 */
export function isActiveHref(pathname: string, href: string): boolean {
  const normalise = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  const path = normalise(pathname);
  const target = normalise(href);
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/nav.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Rewrite `src/components/site-header.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { NAV_LINKS, isActiveHref } from "@/lib/nav";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * One line at desktop, an off-canvas drawer below `md`. The active link is marked with
 * `aria-current`, which is also what the styling keys off, so the visual state and the
 * announced state cannot drift apart.
 *
 * The drawer remembers the pathname it was opened at rather than a bare boolean. When the
 * path changes, the remembered path is reset during render (the documented React pattern
 * for resetting state when an input changes), so the drawer closes on any navigation -
 * a drawer link, the brand, and back/forward alike. That reset is a guarded render-phase
 * state adjustment rather than a `setOpen(false)` effect, which would trip this repo's
 * `react-hooks/set-state-in-effect` rule, and it is also why the remembered path cannot
 * simply be left to stop matching: history returning to that path would reopen the drawer.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpenAt(null);
  }
  const open = openAt !== null && openAt === pathname;

  return (
    <header className="border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-5 md:px-8">
        <Link
          href="/"
          className="focus-ring text-accent font-mono text-sm font-semibold"
          aria-label="Francesco Tenace, home"
        >
          ~/ft
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm whitespace-nowrap">
            {NAV_LINKS.map((link) => {
              const active = isActiveHref(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "focus-ring rounded-full px-3 py-1.5 transition-colors",
                      active
                        ? "bg-panel text-ink"
                        : "text-ink-muted hover:bg-panel hover:text-ink",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpenAt(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="site-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring text-ink-muted hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full md:hidden"
          >
            {open ? <X size={18} weight="regular" aria-hidden /> : <List size={18} weight="regular" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        id="site-drawer"
        hidden={!open}
        className="border-line bg-surface border-t md:hidden"
      >
        <ul className="mx-auto flex w-full max-w-[1400px] flex-col px-5 py-3">
          {NAV_LINKS.map((link) => {
            const active = isActiveHref(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "focus-ring block rounded-chip px-3 py-2 text-sm",
                    active ? "bg-panel text-ink" : "text-ink-muted",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
```

Note the descender clearance rule from the spec does not apply here (no italic display text), and `rounded-chip` is the `--radius-chip` token.

- [ ] **Step 6: Rewrite `src/components/site-footer.tsx`**

```tsx
import { EnvelopeSimple, Rss } from "@phosphor-icons/react/dist/ssr";
import { CONTACT_LABEL } from "@/lib/nav";

const EMAIL = "ftenace98@gmail.com";

export function SiteFooter() {
  return (
    <footer className="border-line border-t">
      <div className="text-ink-muted mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-3 px-5 py-8 text-xs sm:flex-row sm:items-center md:px-8">
        <p>© {new Date().getFullYear()} Francesco Tenace</p>
        <div className="flex items-center gap-5">
          <a
            href={`mailto:${EMAIL}`}
            className="focus-ring hover:text-ink inline-flex items-center gap-1.5 transition-colors"
          >
            <EnvelopeSimple size={14} weight="regular" aria-hidden />
            {CONTACT_LABEL}
          </a>
          <a
            href="/sitemap.xml"
            className="focus-ring hover:text-ink inline-flex items-center gap-1.5 transition-colors"
          >
            <Rss size={14} weight="regular" aria-hidden />
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
```

The `Imprint` link to `href="#"` is deleted: a dead link is worse than an absent one. If a real imprint page is wanted later it gets added with a real route.

- [ ] **Step 7: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass. The build now fails if `/cv` is missing from the nav's target set only in a link-check sense, not at compile time; Task 17 creates the route, so a 404 for `/cv` is expected until then.

- [ ] **Step 8: Commit**

```bash
git add src/lib/nav.ts src/components/site-header.tsx src/components/site-footer.tsx tests/nav.test.ts
git commit -m "feat(nav): declare the nav once and add the CV destination"
```

---

### Task 4: Skip link, focus rings, and the pixel label

**Files:**
- Create: `src/components/skip-link.tsx`
- Create: `src/components/pixel-label.tsx`
- Modify: `src/app/layout.tsx` (render the skip link, give `main` an id where it exists)
- Test: none (presentation only; the behaviours are checked by the keyboard pass in Task 24)

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: `<SkipLink />` with no props, and `<PixelLabel>{children}</PixelLabel>` rendering a `<span>` with the Silkscreen micro-label styling. Later tasks use `<PixelLabel>` wherever an eyebrow is permitted.

- [ ] **Step 1: Write `src/components/skip-link.tsx`**

```tsx
/**
 * Visible only on keyboard focus. The target id is `main`, which every route's main
 * element carries, so the link always lands on the content rather than the chrome.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="focus-ring bg-accent text-accent-ink sr-only rounded-full px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
    >
      Skip to content
    </a>
  );
}
```

- [ ] **Step 2: Write `src/components/pixel-label.tsx`**

```tsx
/**
 * The 8-bit micro-label. Allowed at most once per three sections, so this component
 * exists to make the count greppable: `grep -r "<PixelLabel" src/app`.
 */
export function PixelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-pixel text-accent text-[10px] tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Wire the skip link and the `main` id in `layout.tsx`**

```tsx
import { SkipLink } from "@/components/skip-link";
```

```tsx
      <body
        className="bg-surface text-ink flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <div className="grain" aria-hidden="true" />
        <SkipLink />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
```

- [ ] **Step 4: Give every route's main element the id**

Each route renders its own `<main>`. Add `id="main"` to each: `src/app/page.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/gallery/page.tsx`, `src/app/music/page.tsx`, `src/app/homelab/page.tsx`. Tasks 14, 15, 18-22 rewrite these files; the id is part of their target markup, repeated in each task.

- [ ] **Step 5: Verify in the browser**

Run: `pnpm run dev`, open `http://localhost:3000`, press Tab once.
Expected: a pill-shaped "Skip to content" appears at the top left; Enter moves focus past the header.

- [ ] **Step 6: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/components/skip-link.tsx src/components/pixel-label.tsx src/app/layout.tsx src/app
git commit -m "feat(a11y): add the skip link and the pixel micro-label"
```

---

### Task 5: Move from Lucide to Phosphor

**Files:**
- Modify: `package.json` (add `@phosphor-icons/react`, remove `lucide-react`)
- Modify: every file that imports `lucide-react`: `src/app/page.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/homelab/page.tsx`, `src/app/music/page.tsx`, `src/components/site-footer.tsx`, `src/components/track-list.tsx`
- Test: `tests/icons.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: one icon family. Server components import from `@phosphor-icons/react/dist/ssr`; client components import from `@phosphor-icons/react`. Weight is `regular` everywhere, `fill` only for an active or selected state.

- [ ] **Step 1: Write the failing test**

```ts
// tests/icons.test.ts
/**
 * Characterisation test for the icon family.
 *
 * The design skill wants one family per project, and the migration is only complete when
 * nothing imports the old one. A leftover import is invisible at review time and obvious
 * to this test.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mts)$/.test(path) ? [path] : [];
  });
}

const files = sourceFiles("src");

describe("icons", () => {
  it("imports no icons from lucide-react", () => {
    const offenders = files.filter((f) => readFileSync(f, "utf8").includes("lucide-react"));
    expect(offenders).toEqual([]);
  });

  it("declares lucide-react in no manifest", () => {
    expect(readFileSync("package.json", "utf8")).not.toContain("lucide-react");
  });

  it("imports client-side icons from the package root only", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("@phosphor-icons/react")) continue;
      const isClient = source.trimStart().startsWith('"use client"');
      const deepImport = source.includes('from "@phosphor-icons/react/dist/ssr"');
      expect(isClient && deepImport, `${file} is a client file importing the ssr build`).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/icons.test.ts`
Expected: FAIL, the first test lists the seven files still importing `lucide-react`.

- [ ] **Step 3: Install Phosphor and uninstall Lucide**

```bash
pnpm remove lucide-react
pnpm add @phosphor-icons/react
pnpm exec tsc --noEmit   # expected to fail: every lucide import is now unresolved
```

- [ ] **Step 4: Swap the imports and the JSX name for every call site**

Name mapping used across the seven files. Server components import from the `ssr` entry.

| Lucide | Phosphor | Note |
|---|---|---|
| `Mail` | `EnvelopeSimple` | |
| `Phone` | `Phone` | |
| `MapPin` | `MapPin` | |
| `ExternalLink` | `ArrowSquareOut` | |
| `Calendar` | `CalendarBlank` | |
| `Code` | `Code` | |
| `Server` | `HardDrives` | |
| `Music` | `MusicNotes` | |
| `Languages` | `Translate` | |
| `GraduationCap` | `GraduationCap` | |
| `Download` | `DownloadSimple` | |
| `GitBranch` | `GitBranch` | |
| `Briefcase` | `Briefcase` | |
| `Cpu` | `Cpu` | |
| `HardDrive` | `HardDrives` | |
| `Shield` | `ShieldCheck` | |
| `Home` | `House` | |
| `Network` | `GlobeSimple` | |
| `Box` | `Cube` | |
| `Radio` | `Broadcast` | |
| `Tag` | `Tag` | |
| `ArrowLeft` | `ArrowLeft` | |
| `Loader2` | `Spinner` | drop `animate-spin`; use `className="animate-spin"` unchanged on the Phosphor element |
| `BookOpen` | `BookOpen` | replaced by `Rss` in Task 3's footer |

For each file: change the import path, replace the imported names, add `weight="regular"` to every element, and replace `className="h-4 w-4"` sizing with the `size` prop (`size={16}`, `size={20}`, `size={24}` as appropriate) while keeping any colour class. Example, one call site fully converted:

```tsx
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

<EnvelopeSimple size={16} weight="regular" className="text-accent" aria-hidden />
```

Files marked `"use client"` (`src/components/track-list.tsx`) import from `@phosphor-icons/react` with no `/dist/ssr`.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/icons.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass. `tsc` is the real check here: an unmapped icon name fails the type check.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src tests/icons.test.ts
git commit -m "refactor(icons): one icon family, Phosphor, with Lucide removed"
```

---

### Task 6: The 404 route and the tokenised page header

**Files:**
- Create: `src/app/not-found.tsx`
- Modify: `src/components/page-header.tsx` (full rewrite, 25 lines today)
- Test: none (checked by the 404 verification in Task 24)

**Interfaces:**
- Consumes: `NAV_LINKS` (Task 3), `PixelLabel` (Task 4), tokens (Task 1).
- Produces: `<PageHeader eyebrow title description?>` where `eyebrow` is optional and, when present, renders a `<PixelLabel>`. Later tasks (18-22) call it in this shape.

- [ ] **Step 1: Rewrite `src/components/page-header.tsx`**

```tsx
import { PixelLabel } from "@/components/pixel-label";

/**
 * Every sub-route's masthead. The eyebrow is optional and renders the pixel micro-label;
 * at most one page in three may use it, so most callers omit it.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="border-line border-b">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        {eyebrow && (
          <p className="mb-3">
            <PixelLabel>{eyebrow}</PixelLabel>
          </p>
        )}
        <h1 className="font-display text-ink max-w-[20ch] text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-ink-muted mt-4 max-w-[65ch] text-base leading-relaxed text-pretty">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/app/not-found.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";
import { PixelLabel } from "@/components/pixel-label";

export const metadata: Metadata = {
  title: "Page not found | Francesco Tenace",
  description: "That URL is not on this site.",
};

export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-20 md:px-8">
      <PixelLabel>404</PixelLabel>
      <h1 className="font-display text-ink mt-3 max-w-[20ch] text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">
        Nothing is hosted at this address
      </h1>
      <p className="text-ink-muted mt-4 max-w-[65ch] text-base leading-relaxed">
        The path exists in no build of this site. Everything that does exist is below.
      </p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="focus-ring border-line hover:border-line-strong rounded-full border px-4 py-2 text-sm transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 3: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass.

- [ ] **Step 4: Verify the 404 renders**

Run: `pnpm run build && ls out/404.html`
Expected: `out/404.html` exists. GitHub Pages serves it for unknown paths.

- [ ] **Step 5: Commit**

```bash
git add src/components/page-header.tsx src/app/not-found.tsx
git commit -m "feat(pages): add the branded 404 and tokenise the page header"
```

### Task 7: Motion primitives, part one

**Files:**
- Modify: `package.json` (add `motion`)
- Create: `src/components/reveal.tsx`
- Test: none (verified visually in Task 24; the reduced-motion branch is asserted by reading the source in Step 5)

**Interfaces:**
- Consumes: tokens (Task 1).
- Produces: `<Reveal delay? className? children>` — a `whileInView` wrapper that degrades to a plain `<div>` under reduced motion. Every later section task wraps its blocks in it. Import path for all motion work: `motion/react`.

- [ ] **Step 1: Install motion**

```bash
pnpm add motion
```

- [ ] **Step 2: Write `src/components/reveal.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * The shared scroll reveal. Content enters once, in order, and never re-animates: a
 * reveal that replays on every scroll is noise, not hierarchy.
 *
 * Under reduced motion this is a plain div, so no transform exists to be disabled.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify no scroll listener slipped in**

Run: `grep -rn "addEventListener(\"scroll\"\|addEventListener('scroll'" src || echo "clean"`
Expected: `clean`.

- [ ] **Step 4: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/reveal.tsx
git commit -m "feat(motion): add the shared scroll reveal with a reduced-motion branch"
```

---

### Task 8: Motion primitives, part two

**Files:**
- Create: `src/components/spotlight-card.tsx`
- Create: `src/components/magnetic-cta.tsx`

**Interfaces:**
- Consumes: tokens (Task 1), `motion`.
- Produces: `<SpotlightCard className? children>` (used by the homelab services grid in Task 22) and `<MagneticCta href children className?>` (used by the home hero in Task 15). Both are client components with no context dependency.

- [ ] **Step 1: Write `src/components/spotlight-card.tsx`**

```tsx
"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * A panel whose border carries a soft accent highlight that follows the cursor.
 *
 * The pointer position is a motion value, never React state: state here would re-render
 * the tree on every pointer move and stutter on a phone. Under reduced motion the
 * highlight is simply always present at its resting position.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${x}% ${y}%, var(--accent), transparent 70%)`;

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || reduce) return;
    const rect = node.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width) * 100);
    y.set(((event.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`border-line bg-panel relative overflow-hidden rounded-panel border p-5 ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        style={{ backgroundImage: glow }}
        className="pointer-events-none absolute inset-0 opacity-15"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/magnetic-cta.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";

/**
 * The primary call to action. It leans toward the cursor by a few pixels, which is
 * feedback that the element is live, and it springs back on leave.
 *
 * The pull is a motion value plus a spring, so the React tree is not re-rendered while
 * the pointer moves. Under reduced motion it is a plain link.
 */
export function MagneticCta({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 120, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 120, damping: 15 });

  const base =
    "focus-ring bg-accent text-accent-ink inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";
  const classes = `${base} ${className ?? ""}`;

  if (reduce) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div
      style={{ x, y }}
      className="inline-block"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * 12);
        y.set(((event.clientY - rect.top) / rect.height - 0.5) * 12);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Link href={href} className={classes}>
        {children}
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 3: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/spotlight-card.tsx src/components/magnetic-cta.tsx
git commit -m "feat(motion): add the spotlight panel and the magnetic call to action"
```

---

### Task 9: The sprite grid and the sheet contract

**Files:**
- Create: `src/sprites/sheet.ts`
- Create: `src/sprites/trainer.ts`
- Test: `tests/sprite-sheet.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Palette = Record<string, string>` (single characters to CSS colours, `"."` is transparent)
  - `type Grid = readonly string[]`
  - `type FrameRef = { frame: number; dx?: number; dy?: number }`
  - `type SpriteSheet = { name: string; cell: { width: number; height: number }; palette: Palette; frames: readonly Grid[]; states: Record<"idle" | "walk" | "interact", readonly FrameRef[]> }`
  - `REQUIRED_STATES: readonly ["idle", "walk", "interact"]`
  - `validateSheet(sheet: SpriteSheet): string[]` — every problem it finds, empty array when valid
  - `TRANSPARENT = "."`
  - `TRAINER: SpriteSheet` — the shipped sheet

- [ ] **Step 1: Write the failing test**

```ts
// tests/sprite-sheet.test.ts
/**
 * Characterisation tests for the sprite grid and the sheet contract.
 *
 * A pixel grid is authored by hand, one character per pixel, so a miscounted row is the
 * mistake that actually happens here. This test is what turns that mistake into a failed
 * test instead of a torn PNG shipped to the hero.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REQUIRED_STATES, TRANSPARENT, validateSheet } from "@/sprites/sheet";
import { TRAINER } from "@/sprites/trainer";

describe("TRAINER sheet", () => {
  it("is valid", () => {
    expect(validateSheet(TRAINER)).toEqual([]);
  });

  it("uses a 16x24 cell", () => {
    expect(TRAINER.cell).toEqual({ width: 16, height: 24 });
  });

  it("every frame has exactly one row per pixel row, each the cell width", () => {
    for (const [i, frame] of TRAINER.frames.entries()) {
      expect(frame).toHaveLength(TRAINER.cell.height);
      for (const row of frame) {
        expect(row, `frame ${i} has a row of the wrong width`).toHaveLength(TRAINER.cell.width);
      }
    }
  });

  it("uses only palette characters", () => {
    const allowed = new Set(Object.keys(TRAINER.palette));
    for (const frame of TRAINER.frames) {
      for (const row of frame) {
        for (const char of row) expect(allowed.has(char)).toBe(true);
      }
    }
  });

  it("has a GBA-sized palette with a transparent entry", () => {
    const keys = Object.keys(TRAINER.palette);
    expect(keys).toContain(TRANSPARENT);
    expect(keys.length).toBeGreaterThanOrEqual(6);
    expect(keys.length).toBeLessThanOrEqual(9);
    for (const key of keys) expect(key).toHaveLength(1);
  });

  it("declares the three states with the documented frame counts", () => {
    expect(Object.keys(TRAINER.states)).toEqual([...REQUIRED_STATES]);
    expect(TRAINER.states.idle).toHaveLength(2);
    expect(TRAINER.states.walk).toHaveLength(4);
    expect(TRAINER.states.interact).toHaveLength(2);
  });

  it("references only frames that exist, and offsets that stay on the canvas", () => {
    for (const state of REQUIRED_STATES) {
      for (const ref of TRAINER.states[state]) {
        expect(ref.frame).toBeGreaterThanOrEqual(0);
        expect(ref.frame).toBeLessThan(TRAINER.frames.length);
        expect(Math.abs(ref.dx ?? 0)).toBeLessThanOrEqual(2);
        expect(Math.abs(ref.dy ?? 0)).toBeLessThanOrEqual(2);
      }
    }
  });

  it("draws something", () => {
    const opaque = TRAINER.frames.flatMap((frame) =>
      frame.flatMap((row) => [...row].filter((c) => c !== TRANSPARENT)),
    );
    expect(opaque.length).toBeGreaterThan(100);
  });
});

describe("validateSheet", () => {
  const broken = {
    ...TRAINER,
    frames: [["!"]] as readonly string[][],
  };

  it("reports the problems instead of throwing", () => {
    const problems = validateSheet(broken);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("\n")).toMatch(/row|palette/i);
  });
});

describe("sprite animation CSS", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("defines one keyframe per state and a reduced-motion escape", () => {
    for (const state of REQUIRED_STATES) {
      expect(css).toContain(`@keyframes sprite-${state}`);
    }
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*sprite-idle/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/sprite-sheet.test.ts`
Expected: FAIL with a resolution error for `@/sprites/sheet`.

- [ ] **Step 3: Write `src/sprites/sheet.ts`**

```ts
export type Palette = Record<string, string>;
export type Grid = readonly string[];
export type FrameRef = { frame: number; dx?: number; dy?: number };
export type SpriteState = "idle" | "walk" | "interact";

export type SpriteSheet = {
  name: string;
  cell: { width: number; height: number };
  palette: Palette;
  frames: readonly Grid[];
  states: Record<SpriteState, readonly FrameRef[]>;
};

/** The transparent pixel. Every other palette key is an opaque colour. */
export const TRANSPARENT = ".";

/** The rows a sheet must declare, in the order they are drawn. */
export const REQUIRED_STATES: readonly SpriteState[] = ["idle", "walk", "interact"] as const;

/**
 * Every problem with a sheet, as human-readable lines. An empty array means valid.
 *
 * This returns rather than throws so the test can report all the problems in one run
 * instead of one per fix, and so the build script can refuse to write a broken sheet.
 */
export function validateSheet(sheet: SpriteSheet): string[] {
  const problems: string[] = [];
  const { width, height } = sheet.cell;

  if (width <= 0 || height <= 0) problems.push(`cell size must be positive, got ${width}x${height}`);

  const paletteKeys = Object.keys(sheet.palette);
  if (!paletteKeys.includes(TRANSPARENT)) problems.push(`palette must define ${TRANSPARENT}`);
  for (const key of paletteKeys) {
    if (key.length !== 1) problems.push(`palette key ${JSON.stringify(key)} is not a single character`);
  }
  if (paletteKeys.length < 6 || paletteKeys.length > 9) {
    problems.push(`palette has ${paletteKeys.length} entries, expected between 6 and 9`);
  }

  if (sheet.frames.length === 0) problems.push("sheet has no frames");

  sheet.frames.forEach((frame, index) => {
    if (frame.length !== height) {
      problems.push(`frame ${index} has ${frame.length} rows, expected ${height}`);
    }
    frame.forEach((row, y) => {
      if (row.length !== width) {
        problems.push(`frame ${index} row ${y} is ${row.length} characters, expected ${width}`);
      }
      for (const char of row) {
        if (!paletteKeys.includes(char)) {
          problems.push(`frame ${index} row ${y} uses ${JSON.stringify(char)}, which is not in the palette`);
        }
      }
    });
  });

  for (const state of REQUIRED_STATES) {
    const refs = sheet.states[state];
    if (!refs || refs.length === 0) {
      problems.push(`state ${state} is missing or empty`);
      continue;
    }
    for (const ref of refs) {
      if (!Number.isInteger(ref.frame) || ref.frame < 0 || ref.frame >= sheet.frames.length) {
        problems.push(`state ${state} references frame ${ref.frame}, which does not exist`);
      }
      for (const [axis, value] of [["dx", ref.dx], ["dy", ref.dy]] as const) {
        if (value !== undefined && (!Number.isInteger(value) || Math.abs(value) > 2)) {
          problems.push(`state ${state} has an out-of-range ${axis} of ${value}`);
        }
      }
    }
  }

  return problems;
}
```

- [ ] **Step 4: Write `src/sprites/trainer.ts`**

```ts
/*
 * Relative `.ts` specifier, as in `png.ts`: `scripts/build-sprite.ts` loads this file under
 * bare Node, which resolves neither the `@/` alias nor an extensionless relative import.
 */
import { TRANSPARENT, type SpriteSheet } from "./sheet.ts";

/**
 * The trainer sprite: eight colours plus transparency, two authored frames, and three
 * animated states derived from them. `walk` and `interact` reuse the frames with small
 * offsets, which is how sprites this size actually animate, and it keeps the art
 * reviewable: two grids to read, not eight.
 *
 * Rows are one character per pixel. The test enforces width and height, so a miscounted
 * row fails a test rather than tearing the sprite.
 */
export const TRAINER: SpriteSheet = {
  name: "trainer",
  cell: { width: 16, height: 24 },
  palette: {
    [TRANSPARENT]: "transparent",
    o: "#0d1120", // outline
    h: "#c8433c", // cap
    H: "#8a2a26", // cap shade
    s: "#f0c39a", // skin
    c: "#3f7f6b", // jacket
    C: "#2e5d4f", // jacket shade
    t: "#2a3244", // trousers
    w: "#f5f5f2", // highlight
  },
  frames: [
    [
      "................",
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...HHhhhhhhHH...",
      "...osssssssso...",
      "...oswwsswwso...",
      "...osssssssso...",
      "....osssssso....",
      "...occcccccco...",
      "...occcccccco...",
      "...soccccccos...",
      "...soccccccos...",
      "...soccccccos...",
      "...socCccccos...",
      "...soCCCCCCos...",
      "....otttttto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "...ottto.ottto..",
      "................",
    ],
    [
      "................",
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...HHhhhhhhHH...",
      "...osssssssso...",
      "...osssssssso...",
      "...osssssssso...",
      "....osssssso....",
      "...occcccccco...",
      "...occcccccco...",
      "...soccccccos...",
      "...soccccccos...",
      "...soccccccos...",
      "...socCccccos...",
      "...soCCCCCCos...",
      "....otttttto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "...ottto.ottto..",
      "................",
    ],
  ],
  states: {
    idle: [{ frame: 0 }, { frame: 1, dy: 1 }],
    walk: [
      { frame: 0, dx: 0 },
      { frame: 0, dx: 0, dy: 1 },
      { frame: 1, dx: 1 },
      { frame: 1, dx: 1, dy: 1 },
    ],
    interact: [{ frame: 0, dy: -1 }, { frame: 1 }],
  },
};
```

The second frame differs from the first only in row 7: the eyes close (`w` becomes `s`), which is the blink. Any further art iteration happens during Task 11 while looking at the rendered sprite; the test keeps it valid at every step.

- [ ] **Step 5: Add the sprite keyframes to `globals.css`**

Append to `src/app/globals.css`. The distances are the strip widths at 4x scale, which is the only scale the component renders: `idle` and `interact` are 2 cells (128px), `walk` is 4 cells (256px), each cell 64x96 at 4x.

```css
/*
 * Sprite strips. One keyframe per state; the distance is the strip width at 4x scale
 * (cell 16x24 rendered at 4x, so 64x96 per cell). `steps()` holds each frame, which is
 * what a pixel sprite needs: interpolation would smear it.
 */
@keyframes sprite-idle {
  to {
    background-position-x: -128px;
  }
}

@keyframes sprite-walk {
  to {
    background-position-x: -256px;
  }
}

@keyframes sprite-interact {
  to {
    background-position-x: -128px;
  }
}

.sprite-idle {
  animation: sprite-idle 1.2s steps(2) infinite;
}

.sprite-walk {
  animation: sprite-walk 0.6s steps(4) infinite;
}

.sprite-interact {
  animation: sprite-interact 0.9s steps(2) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .sprite-idle,
  .sprite-walk,
  .sprite-interact {
    animation: none;
  }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/sprite-sheet.test.ts`
Expected: PASS, 10 tests. If a row-width test fails, fix the counted row in `TRAINER` rather than loosening the test.

- [ ] **Step 7: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/sprites/sheet.ts src/sprites/trainer.ts src/app/globals.css tests/sprite-sheet.test.ts
git commit -m "feat(sprite): author the trainer grid and pin the sheet contract"
```

---

### Task 10: The PNG compiler and the build script

**Files:**
- Create: `src/sprites/png.ts`
- Create: `scripts/build-sprite.ts`
- Modify: `tsconfig.json` (add `allowImportingTsExtensions`)
- Modify: `package.json` (add the `build:sprite` script)
- Test: `tests/png.test.ts` (create)

**Interfaces:**
- Consumes: `SpriteSheet`, `SpriteState`, `TRANSPARENT`, `TRAINER`, `validateSheet` (Task 9).
- Produces:
  - `encodePng(width: number, height: number, rgba: Uint8Array): Buffer`
  - `scaleRgba(rgba: Uint8Array, width: number, height: number, scale: number): { width: number; height: number; rgba: Uint8Array }`
  - `renderCell(sheet: SpriteSheet, ref: FrameRef, scale: number): { width: number; height: number; rgba: Uint8Array }`
  - `buildStrip(sheet: SpriteSheet, state: SpriteState, scale: number): { width: number; height: number; rgba: Uint8Array; png: Buffer }`
  - `parsePngHeader(png: Buffer): { width: number; height: number; bitDepth: number; colorType: number }`
  - an npm script `build:sprite`

- [ ] **Step 1: Write the failing test**

```ts
// tests/png.test.ts
/**
 * Characterisation tests for the dependency-free PNG writer.
 *
 * There is no image library in this repo and there will not be one: a PNG is a signature,
 * three chunks and a CRC, and `node:zlib` does the hard part. These tests decode what the
 * writer produced, so a wrong chunk length or a bad CRC fails here rather than in a
 * browser that silently refuses the image.
 */
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildStrip, encodePng, parsePngHeader, renderCell, scaleRgba } from "@/sprites/png";
import { TRAINER } from "@/sprites/trainer";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("encodePng", () => {
  const rgba = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 255, 9, 9, 9, 0]);
  const png = encodePng(2, 2, rgba);

  it("starts with the PNG signature", () => {
    expect(png.subarray(0, 8)).toEqual(SIGNATURE);
  });

  it("ends with an IEND chunk", () => {
    expect(png.subarray(-8, -4).toString("latin1")).toBe("IEND");
  });

  it("records the real dimensions, 8 bits per channel and RGBA", () => {
    expect(parsePngHeader(png)).toEqual({ width: 2, height: 2, bitDepth: 8, colorType: 6 });
  });

  it("stores one filter byte per row and the pixels verbatim", () => {
    const idatLength = png.readUInt32BE(8 + 25);
    const idat = png.subarray(8 + 25 + 8, 8 + 25 + 8 + idatLength);
    const raw = inflateSync(idat);
    expect(raw).toHaveLength((2 * 4 + 1) * 2);
    expect(raw[0]).toBe(0);
    expect(raw[1]).toBe(255);
    expect(raw[2]).toBe(0);
    expect(raw[5]).toBe(0);
    expect(raw[6]).toBe(255);
    expect(raw[7]).toBe(0);
    expect(raw[8]).toBe(128);
    expect(raw[9]).toBe(0);
    expect(raw[10]).toBe(0);
    expect(raw[11]).toBe(0);
    expect(raw[12]).toBe(255);
    expect(raw[13]).toBe(255);
    expect(raw[14]).toBe(9);
    expect(raw[15]).toBe(9);
    expect(raw[16]).toBe(9);
    expect(raw[17]).toBe(0);
  });

  it("returns a buffer", () => {
    expect(Buffer.isBuffer(png)).toBe(true);
  });
});

describe("scaleRgba", () => {
  it("multiplies each pixel by the scale", () => {
    const source = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const scaled = scaleRgba(source, 2, 1, 2);
    expect(scaled.width).toBe(4);
    expect(scaled.height).toBe(2);
    expect([...scaled.rgba.subarray(0, 4)]).toEqual([1, 2, 3, 4]);
    expect([...scaled.rgba.subarray(4, 8)]).toEqual([1, 2, 3, 4]);
    expect([...scaled.rgba.subarray(8, 12)]).toEqual([5, 6, 7, 8]);
    expect([...scaled.rgba.subarray(16, 20)]).toEqual([1, 2, 3, 4]);
    expect([...scaled.rgba.subarray(24, 28)]).toEqual([5, 6, 7, 8]);
  });

  it("refuses a scale below one", () => {
    expect(() => scaleRgba(new Uint8Array(4), 1, 1, 0)).toThrow(/scale/i);
  });
});

describe("renderCell", () => {
  it("renders the cell size at 1x", () => {
    const cell = renderCell(TRAINER, { frame: 0 }, 1);
    expect(cell).toMatchObject({ width: 16, height: 24 });
    expect(cell.rgba).toHaveLength(16 * 24 * 4);
  });

  it("leaves transparent pixels at zero alpha", () => {
    const cell = renderCell(TRAINER, { frame: 0 }, 1);
    const alphaAt = (x: number, y: number) => cell.rgba[(y * 16 + x) * 4 + 3];
    expect(alphaAt(0, 0)).toBe(0);
    expect(alphaAt(7, 6)).toBe(255);
  });

  it("applies the frame offset without leaving the canvas", () => {
    const base = renderCell(TRAINER, { frame: 0 }, 1);
    const shifted = renderCell(TRAINER, { frame: 0, dy: 1 }, 1);
    const opaqueCount = (cell: { rgba: Uint8Array }) =>
      [...cell.rgba].filter((alpha, index) => index % 4 === 3 && alpha === 255).length;
    // The grid's bottom row is empty, so a one-pixel downward shift loses nothing.
    expect(opaqueCount(shifted)).toBe(opaqueCount(base));
    expect(shifted.rgba[(8 * 16 + 7) * 4 + 3]).toBe(255);
  });
});

describe("buildStrip", () => {
  it("is as wide as its frame count times the cell width, at any integer scale", () => {
    const idle = buildStrip(TRAINER, "idle", 1);
    const walk = buildStrip(TRAINER, "walk", 4);
    expect(idle.width).toBe(16 * 2);
    expect(idle.height).toBe(24);
    expect(walk.width).toBe(16 * 4 * 4);
    expect(walk.height).toBe(24 * 4);
    expect(parsePngHeader(walk.png)).toEqual({
      width: 256,
      height: 96,
      bitDepth: 8,
      colorType: 6,
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/png.test.ts`
Expected: FAIL with a resolution error for `@/sprites/png`.

- [ ] **Step 3: Write `src/sprites/png.ts`**

```ts
import { deflateSync } from "node:zlib";
/*
 * The relative `.ts` specifier is deliberate. `scripts/build-sprite.ts` loads this module
 * under bare Node (`--experimental-strip-types`), which does not resolve tsconfig `paths`,
 * so the `@/` alias used elsewhere in the repo cannot be used here. Node also requires the
 * explicit extension for a relative TypeScript import. Do not "tidy" this back to `@/`.
 */
import { TRANSPARENT, type FrameRef, type SpriteSheet, type SpriteState } from "./sheet.ts";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** One PNG chunk: length, type, payload, CRC over type and payload. */
function chunk(type: string, payload: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length, 0);
  const body = Buffer.concat([Buffer.from(type, "latin1"), payload]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

/** Convert one palette character to RGBA using the sheet's palette. */
function pixelFromChar(sheet: SpriteSheet, char: string): [number, number, number, number] {
  const colour = sheet.palette[char];
  if (colour === undefined) throw new Error(`character ${JSON.stringify(char)} is not in the palette`);
  if (char === TRANSPARENT || colour === "transparent") return [0, 0, 0, 0];
  const hex = colour.replace("#", "");
  if (hex.length !== 6) throw new Error(`palette colour ${colour} is not a 6-digit hex value`);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
    255,
  ];
}

/** Write an 8-bit RGBA PNG. No dependency: `node:zlib` does the compression. */
export function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  if (rgba.length !== width * height * 4) {
    throw new Error(`expected ${width * height * 4} bytes of RGBA, received ${rgba.length}`);
  }
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour with alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace
  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Nearest-neighbour upscale, which is the only correct scale for pixel art. */
export function scaleRgba(
  rgba: Uint8Array,
  width: number,
  height: number,
  scale: number,
): { width: number; height: number; rgba: Uint8Array } {
  if (!Number.isInteger(scale) || scale < 1) {
    throw new Error(`scale must be an integer of at least 1, received ${scale}`);
  }
  if (scale === 1) return { width, height, rgba };
  const outWidth = width * scale;
  const outHeight = height * scale;
  const out = new Uint8Array(outWidth * outHeight * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = (y * width + x) * 4;
      const pixel = rgba.subarray(source, source + 4);
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const target = ((y * scale + sy) * outWidth + (x * scale + sx)) * 4;
          out.set(pixel, target);
        }
      }
    }
  }
  return { width: outWidth, height: outHeight, rgba: out };
}

/** Render one cell of the sheet at its offset, then upscale it. */
export function renderCell(
  sheet: SpriteSheet,
  ref: FrameRef,
  scale: number,
): { width: number; height: number; rgba: Uint8Array } {
  const { width, height } = sheet.cell;
  const frame = sheet.frames[ref.frame];
  if (!frame) throw new Error(`frame ${ref.frame} does not exist`);
  const base = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const row = frame[y] ?? "";
    for (let x = 0; x < width; x += 1) {
      const char = row[x] ?? TRANSPARENT;
      base.set(pixelFromChar(sheet, char), (y * width + x) * 4);
    }
  }
  if (!ref.dx && !ref.dy) return scaleRgba(base, width, height, scale);
  const shifted = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const targetX = x + (ref.dx ?? 0);
      const targetY = y + (ref.dy ?? 0);
      if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) continue;
      const source = (y * width + x) * 4;
      shifted.set(base.subarray(source, source + 4), (targetY * width + targetX) * 4);
    }
  }
  return scaleRgba(shifted, width, height, scale);
}

/** A horizontal strip of every cell in a state, ready for CSS `steps()` animation. */
export function buildStrip(
  sheet: SpriteSheet,
  state: SpriteState,
  scale: number,
): { width: number; height: number; rgba: Uint8Array; png: Buffer } {
  const refs = sheet.states[state];
  if (!refs.length) throw new Error(`state ${state} has no frames`);
  const cells = refs.map((ref) => renderCell(sheet, ref, scale));
  const width = cells.reduce((total, cell) => total + cell.width, 0);
  const height = cells[0].height;
  const rgba = new Uint8Array(width * height * 4);
  let offset = 0;
  for (const cell of cells) {
    if (cell.height !== height) throw new Error(`state ${state} mixes cell heights`);
    for (let y = 0; y < height; y += 1) {
      const rowStart = y * cell.width * 4;
      rgba.set(
        cell.rgba.subarray(rowStart, rowStart + cell.width * 4),
        (y * width + offset) * 4,
      );
    }
    offset += cell.width;
  }
  return { width, height, rgba, png: encodePng(width, height, rgba) };
}

/** Read back the header fields a test or a tool cares about. */
export function parsePngHeader(png: Buffer): {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
} {
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    bitDepth: png[24],
    colorType: png[25],
  };
}
```

`png.ts` imports `node:zlib`, so it must not be imported by any component. Only the build script and its test import it.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/png.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Write `scripts/build-sprite.ts`**

Type stripping is what lets a `.ts` script import a `.ts` module directly on Node 22, which is why the relative imports below end in `.ts` and why `tsconfig.json` gains `allowImportingTsExtensions`.

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildStrip } from "../src/sprites/png.ts";
import { REQUIRED_STATES, validateSheet } from "../src/sprites/sheet.ts";
import { TRAINER } from "../src/sprites/trainer.ts";

/**
 * Compile every sprite sheet into the PNG strips the site serves.
 *
 * Run with `pnpm run build:sprite`. Node prints an experimental type-stripping warning on
 * 22.x, which is expected and harmless. The output is committed, so a fresh clone and CI
 * never need this script to build.
 */
const SCALES = [1, 4] as const;
const OUT_DIR = join(process.cwd(), "public", "sprites");

const problems = validateSheet(TRAINER);
if (problems.length > 0) {
  console.error(`Refusing to build ${TRAINER.name}:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const state of REQUIRED_STATES) {
  for (const scale of SCALES) {
    const strip = buildStrip(TRAINER, state, scale);
    const file = join(OUT_DIR, `${TRAINER.name}-${state}@${scale}x.png`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, strip.png);
    console.log(
      `${file} ${strip.width}x${strip.height} ${strip.png.length} bytes`,
    );
  }
}
```

- [ ] **Step 6: Allow `.ts` import specifiers and add the script**

In `tsconfig.json`, add one key to `compilerOptions` (it is legal because `noEmit` is already true):

```json
    "allowImportingTsExtensions": true,
```

In `package.json`, add to `scripts`:

```json
    "build:sprite": "node --experimental-strip-types scripts/build-sprite.ts",
```

- [ ] **Step 7: Generate the strips and check the output**

Run: `pnpm run build:sprite && ls -l public/sprites/`
Expected: six files, `trainer-idle@1x.png` (32x24), `trainer-idle@4x.png` (128x96), `trainer-walk@1x.png` (64x24), `trainer-walk@4x.png` (256x96), `trainer-interact@1x.png` (32x24), `trainer-interact@4x.png` (128x96).

- [ ] **Step 8: Look at the sprite**

Open `http://localhost:3000/sprites/trainer-idle@4x.png` with `pnpm run dev` running, or open the file directly.
Expected: a small trainer figure, crisp, with a transparent background. If the figure does not read as a person, iterate the grids in `src/sprites/trainer.ts` and re-run Step 7; the test keeps the grid valid.

- [ ] **Step 9: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/sprites/png.ts scripts/build-sprite.ts tsconfig.json package.json public/sprites tests/png.test.ts
git commit -m "feat(sprite): compile the grid to PNG strips with no image dependency"
```

---

### Task 11: The sprite component

**Files:**
- Create: `src/components/scene/sprite.tsx`

**Interfaces:**
- Consumes: the strips (Task 10), the sprite CSS classes (Task 9).
- Produces: `<Sprite state?: "idle" | "walk" | "interact" className?: string />`. There is no `label` prop: the sprite is decorative, so it carries `aria-hidden` and any meaning it has in the hero is stated in adjacent text. Task 13 (the scene hero) renders it with `state="idle"`.

- [ ] **Step 1: Write `src/components/scene/sprite.tsx`**

```tsx
import type { SpriteState } from "@/sprites/sheet";

/**
 * The pixel sprite, served as a 4x strip and animated by CSS `steps()`.
 *
 * It is a background image rather than an `<img>` because the animation is a
 * background-position step. It is `aria-hidden` because the sprite is decoration:
 * whatever it means in the hero is also said in text next to it.
 *
 * One cell at 4x is 64x96, which is why the element is exactly that size and why the
 * strip widths in `globals.css` are the numbers they are.
 */
export function Sprite({
  state = "idle",
  className,
}: {
  state?: SpriteState;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`sprite-${state} inline-block h-24 w-16 [image-rendering:pixelated] ${className ?? ""}`}
      style={{
        backgroundImage: `url(/sprites/trainer-${state}@4x.png)`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
```

- [ ] **Step 2: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass, and `out/sprites/` contains the six PNGs.

- [ ] **Step 3: Verify both states render**

Temporarily render `<Sprite state="idle" />` and `<Sprite state="walk" />` in `src/app/page.tsx`, run `pnpm run dev`, and confirm both animate. Revert the temporary render; Task 13 places the real one.

- [ ] **Step 4: Commit**

```bash
git add src/components/scene/sprite.tsx
git commit -m "feat(sprite): render the animated pixel sprite"
```

---

### Task 12: The starfield

**Files:**
- Create: `src/components/scene/starfield.tsx`

**Interfaces:**
- Consumes: `--star` (Task 1), `motion`.
- Produces: `<Starfield density?: "sparse" | "dense" className?: string />` — three parallax layers, `aria-hidden`, absolutely positioned inside a `relative` parent. Task 13 places it behind the hero scene.

- [ ] **Step 1: Write `src/components/scene/starfield.tsx`**

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Three star layers at different parallax speeds, which is what reads as depth.
 *
 * The layers are CSS gradients, not hundreds of elements: the DOM cost of a starfield
 * built from divs is the thing that makes it janky on a phone. Only `transform` moves,
 * and only via a scroll-linked motion value, never a scroll listener.
 */
const LAYERS = [
  { size: "3px 3px", alpha: 0.55, distance: -40, tile: "180px 180px" },
  { size: "2px 2px", alpha: 0.35, distance: -80, tile: "120px 120px" },
  { size: "1px 1px", alpha: 0.22, distance: -130, tile: "90px 90px" },
] as const;

export function Starfield({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const near = useTransform(scrollYProgress, [0, 1], [0, LAYERS[0].distance]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, LAYERS[1].distance]);
  const far = useTransform(scrollYProgress, [0, 1], [0, LAYERS[2].distance]);
  const offsets = reduce ? [0, 0, 0] : [near, mid, far];

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {LAYERS.map((layer, index) => (
        <motion.div
          key={layer.tile}
          style={{
            y: offsets[index],
            opacity: layer.alpha,
            backgroundSize: layer.tile,
            backgroundImage: `radial-gradient(${layer.size} at 20% 30%, var(--star), transparent 60%),
              radial-gradient(${layer.size} at 70% 15%, var(--star), transparent 60%),
              radial-gradient(${layer.size} at 45% 70%, var(--star), transparent 60%),
              radial-gradient(${layer.size} at 85% 55%, var(--star), transparent 60%)`,
          }}
          className="absolute inset-0"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass.

- [ ] **Step 3: Verify reduced motion**

In DevTools, emulate `prefers-reduced-motion: reduce`, scroll the hero, and confirm the layers do not shift.

- [ ] **Step 4: Commit**

```bash
git add src/components/scene/starfield.tsx
git commit -m "feat(scene): add the parallax starfield"
```

---

### Task 13: The scene hero and its menu

**Files:**
- Create: `src/components/scene/hub-menu.tsx`

**Interfaces:**
- Consumes: `NAV_LINKS` (Task 3), `Reveal` (Task 7), `MagneticCta` (Task 8), `Sprite` (Task 11), `Starfield` (Task 12).
- Produces: `<HubMenu />` — the destination menu, real links, staggered entry, no props. Task 15 composes the hero around it.

- [ ] **Step 1: Write `src/components/scene/hub-menu.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { NAV_LINKS } from "@/lib/nav";

/**
 * The destination menu, anchored to the hero scene.
 *
 * These are ordinary links with ordinary labels, which is the whole point: the hero reads
 * as a game menu but behaves like a website, so it stays crawlable, keyboard reachable and
 * screen-reader legible. Nothing on this page gates the content behind an interaction.
 */
const BLURB: Record<string, string> = {
  "/": "Start here",
  "/cv": "The professional record",
  "/blog": "Notes and write-ups",
  "/gallery": "Photographs",
  "/music": "What is playing",
  "/homelab": "The rack and what runs on it",
};

export function HubMenu({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <ul className={`grid gap-2 sm:grid-cols-2 ${className ?? ""}`}>
      {NAV_LINKS.map((link, index) => (
        <motion.li
          key={link.href}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : 0.15 + index * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Link
            href={link.href}
            className="focus-ring border-line bg-panel/60 hover:border-accent group flex items-baseline justify-between gap-3 rounded-panel border px-4 py-3 transition-colors"
          >
            <span>
              <span className="font-display text-ink block text-base font-semibold tracking-tight">
                {link.label}
              </span>
              <span className="text-ink-muted block text-xs">{BLURB[link.href]}</span>
            </span>
            <ArrowUpRight
              size={16}
              weight="regular"
              aria-hidden
              className="text-ink-muted group-hover:text-accent shrink-0 transition-colors"
            />
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/components/scene/hub-menu.tsx
git commit -m "feat(scene): add the destination menu"
```

---

### Task 14: The home page's own sections

**Files:**
- Create: `src/components/home/now-strip.tsx`
- Create: `src/components/home/interests-bento.tsx`
- Create: `src/components/home/homelab-band.tsx`
- Create: `src/components/home/latest-writing.tsx`
- Create: `src/components/home/listening-strip.tsx`
- Create: `src/components/home/contact-band.tsx`

**Interfaces:**
- Consumes: `Reveal`, `SpotlightCard`, `PixelLabel`, `CONTACT_LABEL`, tokens.
- Produces: six section components, each with no props and each owning its own content array:
  - `<NowStrip />`
  - `<InterestsBento />`
  - `<HomelabBand />`
  - `<LatestWriting posts={{ slug: string; title: string; date: string; description?: string }[]} />`
  - `<ListeningStrip tracks={{ name: string; artist: string; url: string; image?: string }[]} />`
  - `<ContactBand />`
  Task 15 composes them in order.

**Bento cell count rule:** five interests, five cells, asymmetric 2+3, no empty cell. The cells are grounded in content the site actually has (music from Last.fm, the homelab, the sprite, writing from the blog), not invented interests.

- [ ] **Step 1: Write `src/components/home/now-strip.tsx`**

```tsx
import { Reveal } from "@/components/reveal";

const FACTS = [
  { label: "Building", value: "Industrial machinery orchestration, .NET 9 and Orleans" },
  { label: "Running", value: "An Odroid HC4 on Arch Linux holding this site's music page up" },
  { label: "Playing", value: "Progressive rock, mostly Steven Wilson and King Crimson" },
] as const;

export function NowStrip() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          What I am doing right now
        </h2>
      </Reveal>
      <dl className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <Reveal delay={0.05}>
          <p className="text-ink-muted max-w-[65ch] text-base leading-relaxed text-pretty">
            Full-stack developer by trade, Linux tinkerer by habit. I build distributed
            systems for a living, and I run the machines this site lives on for the same
            reason anyone climbs a hill: to see whether it holds.
          </p>
        </Reveal>
        <div className="flex flex-col gap-6">
          {FACTS.map((fact, index) => (
            <Reveal key={fact.label} delay={0.1 + index * 0.05}>
              <div className="border-line border-l-2 pl-4">
                <dt className="text-ink-muted font-mono text-xs tracking-wide uppercase">
                  {fact.label}
                </dt>
                <dd className="text-ink mt-1 text-sm leading-relaxed">{fact.value}</dd>
              </div>
            </Reveal>
          ))}
        </div>
      </dl>
    </section>
  );
}
```

- [ ] **Step 2: Write `src/components/home/interests-bento.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Broadcast, Disc, GameController, Terminal } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

/**
 * Five interests, five cells, asymmetric 2+3. Two cells carry real visual variation (a
 * photo tile and the accent-tinted tile) so the grid is not five identical text boxes.
 */
export function InterestsBento() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          The things I keep coming back to
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {/* Wide cell: music, with real album art from the last scrobble. */}
        <Reveal className="md:col-span-2">
          <Link
            href="/music"
            className="focus-ring group border-line bg-panel hover:border-accent flex h-full flex-col justify-between rounded-panel border p-6 transition-colors"
          >
            <div className="flex items-center justify-between">
              <Disc size={20} weight="regular" aria-hidden className="text-accent" />
              <ArrowUpRight size={16} weight="regular" aria-hidden className="text-ink-muted" />
            </div>
            <div className="mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                Progressive rock
              </h3>
              <p className="text-ink-muted mt-2 max-w-[45ch] text-sm leading-relaxed">
                Long songs, odd time signatures, and a scrobble feed that has been running
                since before this site existed.
              </p>
            </div>
          </Link>
        </Reveal>

        {/* Tall-ish cell: space. */}
        <Reveal delay={0.05}>
          <div className="border-line bg-sunken relative flex h-full flex-col justify-between overflow-hidden rounded-panel border p-6">
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(2px 2px at 30% 20%, var(--star), transparent 60%), radial-gradient(2px 2px at 75% 45%, var(--star), transparent 60%), radial-gradient(1px 1px at 55% 80%, var(--star), transparent 60%)",
              }}
            />
            <Broadcast size={20} weight="regular" aria-hidden className="text-accent relative" />
            <div className="relative mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">Space</h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                The reason half this site is dark, and the reason the other half has stars
                in it.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Three equal-width cells would be the generic row, so these sit on a 3-column
            track where one spans two, keeping the rhythm uneven. */}
        <Reveal delay={0.1}>
          <div className="border-line bg-panel flex h-full flex-col justify-between rounded-panel border p-6">
            <GameController size={20} weight="regular" aria-hidden className="text-accent" />
            <div className="mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                The Game Boy era
              </h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                Sixteen pixels wide, eight colours, and more personality than most modern
                interfaces manage.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <Link
            href="/homelab"
            className="focus-ring group border-line bg-panel hover:border-accent flex h-full flex-col justify-between rounded-panel border p-6 transition-colors"
          >
            <Terminal size={20} weight="regular" aria-hidden className="text-accent" />
            <div className="mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                Linux
              </h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                Arch on the desktop and on the tiny server in the corner. If it can be
                self-hosted, it probably is.
              </p>
            </div>
          </Link>
        </Reveal>

        <Reveal delay={0.2} className="md:col-span-2">
          <Link
            href="/blog"
            className="focus-ring group border-line bg-panel hover:border-accent relative flex h-full min-h-[180px] flex-col justify-end overflow-hidden rounded-panel border transition-colors"
          >
            {/* A real image slot, not a drawn rectangle: swap the file when the photograph
                exists. `unoptimized` because the export has no image optimiser. */}
            <Image
              src="/sprites/trainer-idle@4x.png"
              alt=""
              width={64}
              height={96}
              unoptimized
              className="absolute top-6 right-8 h-24 w-16 [image-rendering:pixelated] opacity-90"
            />
            <div className="p-6">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                Writing it down
              </h3>
              <p className="text-ink-muted mt-2 max-w-[45ch] text-sm leading-relaxed">
                Half the things I build only make sense once I have written them up, so
                that is where they end up.
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `src/components/home/homelab-band.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

const FACTS = [
  { label: "Host", value: "Odroid HC4, Arch Linux" },
  { label: "Runtime", value: "Docker Compose, native systemd where it fits" },
  { label: "On it", value: "DNS, smart home, reverse proxy, media automation" },
] as const;

export function HomelabBand() {
  return (
    <section className="border-line bg-sunken border-y">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
        <Reveal>
          <div className="border-line relative aspect-[4/3] overflow-hidden rounded-panel border">
            {/* TODO: replace with the real rack photograph at /public/homelab/rack.jpg. */}
            <Image
              src="/homelab/rack-placeholder.svg"
              alt="The homelab rack"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <div>
          <Reveal delay={0.05}>
            <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
              A small rack that does a lot
            </h2>
          </Reveal>
          <dl className="mt-8 flex flex-col gap-5">
            {FACTS.map((fact, index) => (
              <Reveal key={fact.label} delay={0.1 + index * 0.05}>
                <div className="border-line border-l-2 pl-4">
                  <dt className="text-ink-muted font-mono text-xs tracking-wide uppercase">
                    {fact.label}
                  </dt>
                  <dd className="text-ink mt-1 text-sm leading-relaxed">{fact.value}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
          <Reveal delay={0.25}>
            <Link
              href="/homelab"
              className="focus-ring text-accent mt-8 inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              See what runs on it
              <ArrowUpRight size={16} weight="regular" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `src/components/home/latest-writing.tsx`**

```tsx
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export type WritingItem = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

/**
 * The newest post gets the space, the rest are rows. Three equal cards in a row is the
 * layout this page is specifically avoiding.
 */
export function LatestWriting({ posts }: { posts: WritingItem[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;

  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          Latest writing
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <Reveal delay={0.05}>
          <Link href={`/blog/${lead.slug}`} className="focus-ring group block">
            <p className="text-ink-muted font-mono text-xs tabular-nums">{lead.date}</p>
            <h3 className="font-display text-ink group-hover:text-accent mt-2 text-2xl leading-snug font-semibold tracking-tight transition-colors md:text-3xl">
              {lead.title}
            </h3>
            {lead.description && (
              <p className="text-ink-muted mt-3 max-w-[60ch] text-sm leading-relaxed">
                {lead.description}
              </p>
            )}
          </Link>
        </Reveal>
        <ul className="divide-line divide-y">
          {rest.slice(0, 3).map((post, index) => (
            <li key={post.slug}>
              <Reveal delay={0.1 + index * 0.05}>
                <Link href={`/blog/${post.slug}`} className="focus-ring group block py-4">
                  <p className="text-ink-muted font-mono text-xs tabular-nums">{post.date}</p>
                  <h3 className="font-display text-ink group-hover:text-accent mt-1 text-base font-semibold tracking-tight transition-colors">
                    {post.title}
                  </h3>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Write `src/components/home/listening-strip.tsx`**

```tsx
import Image from "next/image";
import { Reveal } from "@/components/reveal";

export type ListeningItem = {
  name: string;
  artist: string;
  url: string;
  image?: string;
};

/**
 * Two recent scrobbles as a quiet mono strip. Real data from the build, no invented
 * numbers, and it exists whether or not Last.fm credentials are present because the
 * caller falls back to the static artist list.
 */
export function ListeningStrip({ tracks }: { tracks: ListeningItem[] }) {
  if (tracks.length === 0) return null;

  return (
    <section className="border-line border-t">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-14 md:px-8">
        <Reveal>
          <h2 className="text-ink-muted font-mono text-xs tracking-wide uppercase">
            Recently played
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {tracks.slice(0, 2).map((track) => (
              <li key={track.url}>
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group flex items-center gap-3"
                >
                  <span className="bg-sunken border-line relative h-12 w-12 shrink-0 overflow-hidden rounded-chip border">
                    {track.image ? (
                      <Image
                        src={track.image}
                        alt={`${track.name} cover`}
                        fill
                        sizes="48px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="text-ink group-hover:text-accent block truncate text-sm font-semibold transition-colors">
                      {track.name}
                    </span>
                    <span className="text-ink-muted block truncate text-xs">{track.artist}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Write `src/components/home/contact-band.tsx`**

```tsx
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { CONTACT_LABEL } from "@/lib/nav";

const EMAIL = "ftenace98@gmail.com";

/**
 * The site's single contact call to action. The same label appears in the footer, which
 * is the one repetition the rule allows: same intent, so same words.
 */
export function ContactBand() {
  return (
    <section className="border-line border-t">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
            Say hello, or hire me
          </h2>
          <a
            href={`mailto:${EMAIL}`}
            className="focus-ring bg-accent text-accent-ink mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <EnvelopeSimple size={16} weight="regular" aria-hidden />
            {CONTACT_LABEL}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create the placeholder rack image**

Create `public/homelab/rack-placeholder.svg`. It is explicitly temporary and named as such, so it cannot be mistaken for the real asset:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Placeholder for the homelab rack photograph">
  <rect width="800" height="600" fill="#0f1116"/>
  <rect x="80" y="120" width="640" height="80" rx="8" fill="#050608" stroke="#2e5d4f" stroke-width="2"/>
  <rect x="80" y="230" width="640" height="80" rx="8" fill="#050608" stroke="#2e5d4f" stroke-width="2"/>
  <rect x="80" y="340" width="640" height="80" rx="8" fill="#050608" stroke="#2e5d4f" stroke-width="2"/>
</svg>
```

- [ ] **Step 8: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/components/home public/homelab/rack-placeholder.svg
git commit -m "feat(home): add the hub's content sections"
```

---

### Task 15: Compose the hub

**Files:**
- Modify: `src/app/page.tsx` (full rewrite, 406 lines today)
- Modify: `src/lib/posts.ts` only if a helper is needed; not expected

**Interfaces:**
- Consumes: everything above, plus `getAllPosts()` from `@/lib/posts` (existing, returns `{ slug, title, date, description?, tags? }[]`).
- Produces: the home route. The CV data and the Person JSON-LD for `hasOccupation` are gone from this file; Task 16 and Task 17 own them.

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

```tsx
import type { Metadata } from "next";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { PixelLabel } from "@/components/pixel-label";
import { MagneticCta } from "@/components/magnetic-cta";
import { Starfield } from "@/components/scene/starfield";
import { Sprite } from "@/components/scene/sprite";
import { HubMenu } from "@/components/scene/hub-menu";
import { NowStrip } from "@/components/home/now-strip";
import { InterestsBento } from "@/components/home/interests-bento";
import { HomelabBand } from "@/components/home/homelab-band";
import { LatestWriting } from "@/components/home/latest-writing";
import { ListeningStrip, type ListeningItem } from "@/components/home/listening-strip";
import { ContactBand } from "@/components/home/contact-band";
import { getAllPosts } from "@/lib/posts";
import { CV_DATA } from "@/lib/cv-data";

export const metadata: Metadata = {
  title: "Francesco Tenace | Full-stack developer, Linux and long songs",
  description:
    "Full-stack developer building distributed systems by day, running a small homelab by night. Progressive rock, retro pixels, and too much Arch Linux.",
};

/** The fallback list when Last.fm credentials are absent, same as the music route. */
const FALLBACK_TRACKS: ListeningItem[] = [
  { name: "Ancestral", artist: "Steven Wilson", url: "https://www.last.fm/music/Steven+Wilson" },
  { name: "Red", artist: "King Crimson", url: "https://www.last.fm/music/King+Crimson" },
];

async function recentListening(): Promise<ListeningItem[]> {
  const key = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  const user = process.env.NEXT_PUBLIC_LASTFM_USER;
  if (!key || !user) return FALLBACK_TRACKS;

  try {
    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", key);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "2");
    const res = await fetch(url);
    if (!res.ok) return FALLBACK_TRACKS;
    const data = (await res.json()) as {
      recenttracks?: {
        track?: {
          name: string;
          url: string;
          artist: { "#text"?: string; name?: string };
          image?: { size: string; "#text": string }[];
        }[];
      };
    };
    const tracks = data.recenttracks?.track ?? [];
    const mapped = tracks.map((track) => {
      const large = track.image?.find((i) => i.size === "extralarge" || i.size === "large");
      return {
        name: track.name,
        artist: track.artist["#text"] ?? track.artist.name ?? "Unknown",
        url: track.url,
        image: large?.["#text"] || undefined,
      };
    });
    return mapped.length > 0 ? mapped : FALLBACK_TRACKS;
  } catch {
    return FALLBACK_TRACKS;
  }
}

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 4);
  const tracks = await recentListening();

  /*
   * Identity only. The CV-specific structured data (`hasOccupation`) lives on `/cv`,
   * so the two pages do not both claim to be a CV. The facts come from the same source
   * either way, so they cannot drift.
   */
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CV_DATA.profile.name,
    jobTitle: CV_DATA.profile.title,
    email: `mailto:${CV_DATA.profile.email}`,
    sameAs: ["https://github.com/10ax"],
    knowsLanguage: CV_DATA.profile.languages.map((language) => language.name),
    knowsAbout: CV_DATA.skills.map((skill) => skill.name),
    alumniOf: { "@type": "CollegeOrUniversity", name: CV_DATA.education.institution },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: the object is fully controlled and JSON.stringify escapes it for JSON-LD.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Hero scene. Fits the initial viewport: no scroll cue, no gate, and the
          destination menu is inside it, so a recruiter reaches the CV in one click and a
          crawler reaches it in one hop. */}
      <header className="relative isolate overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <Starfield />
        <div className="relative mx-auto grid w-full max-w-[1400px] gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <PixelLabel>whoami</PixelLabel>
            <h1 className="font-display text-ink mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
              Francesco Tenace
            </h1>
            <p className="text-ink-muted mt-4 max-w-[65ch] text-lg leading-relaxed text-pretty">
              Full-stack developer. I build distributed systems for a living and keep a
              small rack alive for fun.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticCta href="/cv">View CV</MagneticCta>
              <a
                href="https://github.com/10ax"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring border-line hover:border-line-strong inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <GithubLogo size={16} weight="regular" aria-hidden />
                GitHub
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Sprite state="idle" className="lg:scale-125" />
            <HubMenu className="w-full" />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <NowStrip />
        <InterestsBento />
        <HomelabBand />
        <LatestWriting
          posts={posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            description: post.description,
          }))}
        />
        <ListeningStrip tracks={tracks} />
        <ContactBand />
      </main>
    </>
  );
}
```

`Reveal` is deliberately not imported here: the sections own their own reveals, so the home page is a composition and nothing more.

- [ ] **Step 2: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass.

- [ ] **Step 3: Verify the hub in the browser, both themes**

Run `pnpm run dev`, open `http://localhost:3000`, then toggle the theme.
Expected: the hero fits the viewport at 1280 wide and at 390 wide, the sprite sits still and blinks, the menu links all resolve (except `/cv`, which 404s until Task 17), and no section shows a hardcoded slate or white that ignores the theme.

- [ ] **Step 4: Count the eyebrows**

Run: `grep -rn "<PixelLabel" src/app src/components`
Expected: `src/app/page.tsx` has exactly one (the hero eyebrow, `whoami`), `not-found.tsx` has one, and `page-header.tsx` declares the prop but renders no label of its own. The hub therefore uses one eyebrow for seven sections, which is inside the one-per-three budget.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): compose the hub from the scene and the new sections"
```

### Task 16: The CV data, extracted and pinned

**Files:**
- Create: `src/lib/cv-data.ts`
- Test: `tests/cv-data.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `type Skill`, `type Experience`, `type Language`, `type Education`, `CV_DATA` with the exact shape the old home page used (`profile`, `skills`, `experiences`, `education`, `hobbies`). Tasks 15 and 17 read `CV_DATA`: the home page takes the identity fields, the CV page takes everything.

- [ ] **Step 1: Write the failing test**

```ts
// tests/cv-data.test.ts
/**
 * Characterisation tests for the CV facts.
 *
 * The redesign moves this content to a new route and rewrites every headline around it.
 * The facts themselves are frozen: titles, employers, dates, contact details and the
 * counts. A reformatting that quietly drops a role or changes a date fails here.
 */
import { describe, expect, it } from "vitest";
import { CV_DATA } from "@/lib/cv-data";

describe("CV_DATA", () => {
  it("keeps the identity and contact facts byte-identical", () => {
    expect(CV_DATA.profile.name).toBe("Francesco Tenace");
    expect(CV_DATA.profile.title).toBe("Full-stack Developer");
    expect(CV_DATA.profile.location).toBe("Avellino area, Italy");
    expect(CV_DATA.profile.email).toBe("ftenace98@gmail.com");
    expect(CV_DATA.profile.phone).toBe("+39 3886526207");
  });

  it("keeps all four roles, in order, with their exact companies and periods", () => {
    expect(CV_DATA.experiences.map((e) => e.company)).toEqual([
      "SystemCeramics",
      "Ease2pay group",
      "Moongy Consultant at Dedagroup spa",
      "Kineton Consultant",
    ]);
    expect(CV_DATA.experiences.map((e) => e.period)).toEqual([
      "Jul 2024 - Now",
      "May 2023 - Oct 2023",
      "Oct 2022 - Apr 2023",
      "Sept 2020 - Oct 2022",
    ]);
  });

  it("keeps all eleven skills and their categories", () => {
    expect(CV_DATA.skills).toHaveLength(11);
    expect(CV_DATA.skills.map((s) => s.name)).toContain("Docker/Kubernetes");
    expect(new Set(CV_DATA.skills.map((s) => s.category))).toEqual(
      new Set(["Backend", "Frontend", "DevOps", "Cloud", "Tools"]),
    );
  });

  it("keeps the education and language facts", () => {
    expect(CV_DATA.education.institution).toBe("Polytechnic University of Bari");
    expect(CV_DATA.education.period).toBe("2017 - 2020");
    expect(CV_DATA.profile.languages).toEqual([
      { name: "Italian", level: "Native" },
      { name: "English", level: "C1 Level" },
    ]);
  });

  it("contains no em-dashes, which are banned from user-visible strings", () => {
    const visible = JSON.stringify(CV_DATA);
    expect(visible).not.toContain("—");
    expect(visible).not.toContain("–");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/cv-data.test.ts`
Expected: FAIL with a resolution error for `@/lib/cv-data`.

- [ ] **Step 3: Write `src/lib/cv-data.ts`**

Move the `CV_DATA` object and the `Skill` / `Experience` types out of `src/app/page.tsx` verbatim, with one change: the em-dash in the period `"Jul 2024 - Now"` stays a hyphen (it already is one), and the degree string's curly apostrophe is preserved exactly as it is today. The file exports:

```ts
export type Skill = { name: string; yrs: string; category: string };
export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  tech: string[];
};
export type Language = { name: string; level: string };
export type Education = { degree: string; institution: string; period: string };

export type CvData = {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    summary: string;
    languages: Language[];
  };
  skills: Skill[];
  experiences: Experience[];
  education: Education;
  hobbies: string;
};

/** The CV as published. Frozen: `tests/cv-data.test.ts` pins every fact in here. */
export const CV_DATA: CvData = {
  // ... the exact contents of the current `CV_DATA` in src/app/page.tsx, moved verbatim
};
```

The body of `CV_DATA` is copied byte-for-byte from `src/app/page.tsx:27-133` as it stands today. Do not retype it: copy the block, then keep the types above it.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/cv-data.test.ts`
Expected: PASS, 6 tests. If the "no em-dashes" test fails, find the character in the copied block and replace it with a hyphen.

- [ ] **Step 5: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/lib/cv-data.ts tests/cv-data.test.ts
git commit -m "feat(cv): extract and pin the CV facts"
```

---

### Task 17: The `/cv` route, its structured data and the sitemap

**Files:**
- Create: `src/app/cv/page.tsx`
- Create: `src/components/cv/experience-stack.tsx`
- Modify: `src/app/sitemap.ts:14-20`
- Modify: `tests/metadata-routes.test.ts:56-102`
- Modify: `docs/TROUBLESHOOTING.md` (Known issues entry)
- Test: `tests/metadata-routes.test.ts` (updated)

**Interfaces:**
- Consumes: `CV_DATA` (Task 16), `PageHeader`, `PixelLabel`, `Reveal`, `SpotlightCard`.
- Produces: the `/cv` route, and `<ExperienceStack experiences={Experience[]} />`.

- [ ] **Step 1: Write `src/components/cv/experience-stack.tsx`**

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { MapPin, CalendarBlank } from "@phosphor-icons/react";
import type { Experience } from "@/lib/cv-data";

/**
 * One sticky card per role: each pins near the top and the ones underneath shrink and dim
 * as the next arrives, so the list reads as a sequence rather than a scroll of boxes.
 *
 * Motion only, no scroll hijack and no scroll listener. The scale is driven by each card's
 * own progress, so there is nothing to fight with CSS `position: sticky`.
 */
function StackCard({ experience, index }: { experience: Experience; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.55]);

  return (
    <article
      ref={ref}
      style={{ zIndex: index + 1 }}
      className="sticky top-24 mb-6 last:mb-0"
    >
      <motion.div
        style={reduce ? undefined : { scale, opacity }}
        className="border-line bg-panel rounded-panel border p-6 md:p-8"
      >
        <div className="text-ink-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlank size={14} weight="regular" aria-hidden />
            <span className="tabular">{experience.period}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} weight="regular" aria-hidden />
            {experience.location}
          </span>
        </div>
        <h3 className="font-display text-ink mt-3 text-xl font-semibold tracking-tight">
          {experience.role}
        </h3>
        <p className="text-accent mt-1 text-sm font-medium">{experience.company}</p>
        <p className="text-ink-muted mt-3 max-w-[65ch] text-sm leading-relaxed">
          {experience.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {experience.tech.map((tech) => (
            <li
              key={tech}
              className="border-line bg-sunken text-ink-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
            >
              {tech}
            </li>
          ))}
        </ul>
      </motion.div>
    </article>
  );
}

export function ExperienceStack({ experiences }: { experiences: Experience[] }) {
  return (
    <div>
      {experiences.map((experience, index) => (
        <StackCard key={`${experience.company}-${experience.period}`} experience={experience} index={index} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/cv/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Code, Cpu, GlobeSimple, HardDrives, Translate } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { PixelLabel } from "@/components/pixel-label";
import { Reveal } from "@/components/reveal";
import { ExperienceStack } from "@/components/cv/experience-stack";
import { CV_DATA, type Skill } from "@/lib/cv-data";

export const metadata: Metadata = {
  title: "CV | Francesco Tenace",
  description:
    "Senior Full-stack Developer with 5+ years of experience building scalable distributed systems. Java, .NET, Angular, Kubernetes.",
};

/** Icon per skill category, in the order the bento renders them. */
const CATEGORY_ICON = {
  Backend: HardDrives,
  Frontend: Code,
  DevOps: Cpu,
  Cloud: GlobeSimple,
  Tools: Cpu,
} as const;

export default function CvPage() {
  const { profile, skills, experiences, education, hobbies } = CV_DATA;

  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    knowsLanguage: profile.languages.map((language) => language.name),
    knowsAbout: skills.map((skill) => skill.name),
    alumniOf: { "@type": "CollegeOrUniversity", name: education.institution },
    hasOccupation: experiences.map((experience) => ({
      "@type": "Occupation",
      name: experience.role,
      occupationLocation: { "@type": "Place", name: experience.location },
      hiringOrganization: { "@type": "Organization", name: experience.company },
      description: experience.description,
      skills: experience.tech.join(", "),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: the object is fully controlled and JSON.stringify escapes it for JSON-LD.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <PageHeader
        eyebrow="the record"
        title="Full-stack developer, five years in"
        description={profile.summary}
      />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <section aria-labelledby="experience">
          <h2 id="experience" className="font-display text-ink text-2xl font-semibold tracking-tight">
            Professional experience
          </h2>
          <div className="mt-8">
            <ExperienceStack experiences={experiences} />
          </div>
        </section>

        <section aria-labelledby="skills" className="mt-20">
          <h2 id="skills" className="font-display text-ink text-2xl font-semibold tracking-tight">
            Skills
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Object.entries(skillsByCategory).map(([category, items], index) => {
              const Icon = CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] ?? Code;
              return (
                <Reveal
                  key={category}
                  delay={index * 0.05}
                  className={index === 0 ? "md:col-span-2" : undefined}
                >
                  <div className="border-line bg-panel h-full rounded-panel border p-6">
                    <div className="flex items-center gap-2">
                      <Icon size={18} weight="regular" aria-hidden className="text-accent" />
                      <h3 className="text-ink-muted font-mono text-xs tracking-wide uppercase">
                        {category}
                      </h3>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <li key={skill.name} className="flex items-baseline gap-2">
                          <span className="text-ink text-sm font-medium">{skill.name}</span>
                          <span className="text-accent font-mono text-xs tabular">{skill.yrs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="background" className="mt-20 grid gap-8 md:grid-cols-2">
          <Reveal>
            <div>
              <h2 id="background" className="font-display text-ink text-2xl font-semibold tracking-tight">
                Education
              </h2>
              <div className="border-line mt-4 border-l-2 pl-4">
                <h3 className="text-ink text-base font-semibold">{education.degree}</h3>
                <p className="text-accent mt-1 text-sm">{education.institution}</p>
                <p className="text-ink-muted tabular mt-1 font-mono text-xs">{education.period}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div>
              <h2 className="font-display text-ink text-2xl font-semibold tracking-tight">
                Languages
              </h2>
              <ul className="mt-4 flex flex-col gap-2">
                {profile.languages.map((language) => (
                  <li key={language.name} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-ink inline-flex items-center gap-2">
                      <Translate size={14} weight="regular" aria-hidden className="text-ink-muted" />
                      {language.name}
                    </span>
                    <span className="text-accent font-mono text-xs">{language.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        <section aria-labelledby="outside" className="mt-20">
          <h2 id="outside" className="font-display text-ink text-2xl font-semibold tracking-tight">
            Outside work
          </h2>
          <p className="text-ink-muted mt-4 max-w-[65ch] text-sm leading-relaxed">{hobbies}</p>
          <p className="mt-6">
            <PixelLabel>contact</PixelLabel>
          </p>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            <li>
              <a href={`mailto:${profile.email}`} className="focus-ring text-accent">
                {profile.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="focus-ring text-accent tabular"
              >
                {profile.phone}
              </a>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
```

The `Download CV` button is deliberately absent. It returns in a later change, pointing at a real file, rather than shipping as `href="#"`.

- [ ] **Step 3: Add `/cv` to the sitemap**

In `src/app/sitemap.ts`, insert directly after the home entry:

```ts
    { url: `${SITE_URL}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
```

- [ ] **Step 4: Update the pinned sitemap expectations**

In `tests/metadata-routes.test.ts`:

```ts
  it("lists the six static routes first, in a fixed order", async () => {
    const entries = await loadSitemap(undefined);

    expect(entries.slice(0, 6).map((e) => e.url)).toEqual([
      FALLBACK,
      `${FALLBACK}/cv`,
      `${FALLBACK}/blog`,
      `${FALLBACK}/gallery`,
      `${FALLBACK}/music`,
      `${FALLBACK}/homelab`,
    ]);
  });
```

```ts
    expect(byUrl.get(FALLBACK)).toMatchObject({ changeFrequency: "monthly", priority: 1 });
    expect(byUrl.get(`${FALLBACK}/cv`)).toMatchObject({
      changeFrequency: "monthly",
      priority: 0.9,
    });
```

and in the per-post test, replace every `5` with `6`:

```ts
    expect(entries).toHaveLength(6 + posts.length);
    expect(entries.slice(6).map((e) => e.url)).toEqual(
      posts.map((p) => `${FALLBACK}/blog/${p.slug}`),
    );
    for (const entry of entries.slice(6)) {
      expect(entry).toMatchObject({ changeFrequency: "yearly", priority: 0.7 });
    }
```

```ts
      expect(entries[6 + i].lastModified).toEqual(new Date(post.date));
```

and in the origin test:

```ts
    expect(entries[2].url).toBe("https://example.com/blog");
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/metadata-routes.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 6: Record the schema change in the operating guide**

Append to the Known issues section of `docs/TROUBLESHOOTING.md`:

```markdown
- `/cv` was added to `src/app/sitemap.ts` and to the navigation, which changed the
  contract that `tests/metadata-routes.test.ts` pins. That test now expects six static
  routes and the `/cv` entry carries `priority: 0.9`. If a future change adds a route,
  update the count in that file in the same commit; the test is deliberately brittle so a
  missing sitemap entry is a failure rather than an invisible omission.
```

- [ ] **Step 7: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass, and `out/cv/index.html` exists.

- [ ] **Step 8: Commit**

```bash
git add src/app/cv src/components/cv src/app/sitemap.ts tests/metadata-routes.test.ts docs/TROUBLESHOOTING.md
git commit -m "feat(cv): add the CV route, its structured data and its sitemap entry"
```

---

### Task 18: The blog index

**Files:**
- Modify: `src/app/blog/page.tsx` (full rewrite, 64 lines today)

**Interfaces:**
- Consumes: `PageHeader`, `Reveal`, `getAllPosts()` (existing).
- Produces: the blog index. `getAllPosts()` already returns newest first; no new logic.

- [ ] **Step 1: Rewrite `src/app/blog/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog | Francesco Tenace",
  description: "Notes on engineering, homelab tinkering, and other interests.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        title="Notes"
        description="Things I worked out the hard way, written down so the next attempt is shorter."
      />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        {!lead ? (
          <p className="text-ink-muted text-sm">No posts yet. Check back soon.</p>
        ) : (
          <>
            <Reveal>
              <Link href={`/blog/${lead.slug}`} className="focus-ring group block max-w-[70ch]">
                <p className="text-ink-muted tabular inline-flex items-center gap-1.5 font-mono text-xs">
                  <CalendarBlank size={14} weight="regular" aria-hidden />
                  {lead.date}
                </p>
                <h2 className="font-display text-ink group-hover:text-accent mt-3 text-3xl leading-tight font-semibold tracking-tight transition-colors md:text-4xl">
                  {lead.title}
                </h2>
                {lead.description && (
                  <p className="text-ink-muted mt-3 text-base leading-relaxed text-pretty">
                    {lead.description}
                  </p>
                )}
              </Link>
            </Reveal>

            <ul className="divide-line mt-14 divide-y">
              {rest.map((post, index) => (
                <li key={post.slug}>
                  <Reveal delay={index * 0.04}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="focus-ring group grid gap-2 py-6 md:grid-cols-[10rem_1fr]"
                    >
                      <p className="text-ink-muted tabular font-mono text-xs md:pt-1">{post.date}</p>
                      <div>
                        <h3 className="font-display text-ink group-hover:text-accent text-xl font-semibold tracking-tight transition-colors">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-ink-muted mt-2 max-w-[65ch] text-sm leading-relaxed">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 2: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/app/blog/page.tsx
git commit -m "feat(blog): feature the newest post and list the rest as rows"
```

---

### Task 19: The post page and the reading progress bar

**Files:**
- Create: `src/components/reading-progress.tsx`
- Modify: `src/app/blog/[slug]/page.tsx` (full rewrite, 157 lines today)

**Interfaces:**
- Consumes: `Reveal`, `getAllPosts()`, `getPostBySlug()`.
- Produces: `<ReadingProgress />` (client, no props), and the post route with prev/next navigation.

- [ ] **Step 1: Write `src/components/reading-progress.tsx`**

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * A hairline at the top of the viewport showing how much of the article is behind you.
 *
 * `useScroll` with no target tracks the document, which is exactly the article here. The
 * spring keeps it from jittering on trackpads. Under reduced motion the bar is a plain
 * fixed line at rest, so the position information is still available.
 */
export function ReadingProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduce ? 0 : scaleX }}
      className="bg-accent fixed top-0 left-0 z-[70] h-0.5 w-full origin-left"
    />
  );
}
```

- [ ] **Step 2: Rewrite `src/app/blog/[slug]/page.tsx`**

Keep `generateStaticParams`, `prettyCodeOptions` and the `rehypePrettyCode` wiring exactly as they are; the component map's classes and the page body change. One line inside `generateMetadata` changes too, because the em-dash in the post title is user-visible:

```tsx
    title: `${post.title} | Blog`,
```

```tsx
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-display text-ink mt-10 text-3xl font-semibold tracking-tight" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-display text-ink mt-10 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-display text-ink mt-8 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-ink-muted mt-4 max-w-[65ch] leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-accent focus-ring underline-offset-4 hover:underline" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-ink-muted mt-4 max-w-[65ch] list-disc space-y-1 pl-6" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-ink-muted mt-4 max-w-[65ch] list-decimal space-y-1 pl-6" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { "data-language"?: string }) => {
    if (props["data-language"]) return <code {...props} />;
    return (
      <code
        className="bg-sunken text-accent rounded-chip px-1.5 py-0.5 font-mono text-sm"
        {...props}
      />
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={[
        "border-line bg-sunken mt-6 overflow-x-auto rounded-panel border py-4 text-sm leading-relaxed",
        "[&_code]:bg-transparent [&_code]:p-0 [&_code]:text-ink",
        "[&_code>span[data-line]]:block [&_code>span[data-line]]:px-4",
        "[&_code>span[data-highlighted-line]]:bg-accent/10",
        "[&_code>span[data-highlighted-line]]:border-accent [&_code>span[data-highlighted-line]]:border-l-2",
        "[&_code>span[data-highlighted-line]]:pl-[14px]",
        "[&_mark[data-highlighted-chars]]:bg-accent/20 [&_mark[data-highlighted-chars]]:rounded",
        "[&_mark[data-highlighted-chars]]:px-1",
        // Line numbers: `content-[counter(line)]` sets --tw-content; a raw
        // `[content:counter(line)]` is clobbered by any `before:*` utility. Scoped to
        // `code[data-line-numbers]`, not `pre` (commit 951770d).
        "[&_code[data-line-numbers]]:[counter-reset:line]",
        "[&_code[data-line-numbers]>span[data-line]]:before:content-[counter(line)]",
        "[&_code[data-line-numbers]>span[data-line]]:before:[counter-increment:line]",
        "[&_code[data-line-numbers]>span[data-line]]:before:mr-4 [&_code[data-line-numbers]>span[data-line]]:before:inline-block",
        "[&_code[data-line-numbers]>span[data-line]]:before:w-6 [&_code[data-line-numbers]>span[data-line]]:before:text-right",
        "[&_code[data-line-numbers]>span[data-line]]:before:text-ink-muted [&_code[data-line-numbers]>span[data-line]]:before:tabular-nums",
      ].join(" ")}
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-ink font-semibold" {...props} />
  ),
};
```

and the page body becomes:

```tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const posts = await getAllPosts();
  const index = posts.findIndex((candidate) => candidate.slug === slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <>
      <ReadingProgress />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <Link
          href="/blog"
          className="focus-ring text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft size={16} weight="regular" aria-hidden />
          All notes
        </Link>
        <article className="mt-8">
          <p className="text-ink-muted tabular inline-flex items-center gap-1.5 font-mono text-xs">
            <CalendarBlank size={14} weight="regular" aria-hidden />
            {post.date}
          </p>
          <h1 className="font-display text-ink mt-3 max-w-[25ch] text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-ink-muted mt-3 max-w-[65ch] text-lg leading-relaxed text-pretty">
              {post.description}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-line text-ink-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <div className="border-line mt-10 border-t pt-8">
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

        <nav aria-label="More posts" className="border-line mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
          {newer && (
            <Link href={`/blog/${newer.slug}`} className="focus-ring group">
              <span className="text-ink-muted block font-mono text-xs">Newer</span>
              <span className="font-display text-ink group-hover:text-accent mt-1 block text-lg font-semibold tracking-tight transition-colors">
                {newer.title}
              </span>
            </Link>
          )}
          {older && (
            <Link href={`/blog/${older.slug}`} className="focus-ring group sm:text-right">
              <span className="text-ink-muted block font-mono text-xs">Older</span>
              <span className="font-display text-ink group-hover:text-accent mt-1 block text-lg font-semibold tracking-tight transition-colors">
                {older.title}
              </span>
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}
```

Imports become: `CalendarBlank`, `ArrowLeft` from `@phosphor-icons/react/dist/ssr`, and `ReadingProgress` from `@/components/reading-progress`.

- [ ] **Step 3: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass. `tests/content-blog.test.ts` must stay green untouched: the frontmatter contract did not change.

- [ ] **Step 4: Verify a post in both themes**

Run `pnpm run dev`, open `/blog/welcome`, toggle the theme.
Expected: prose, inline code and code blocks are legible in both, and the shiki block background comes from the token, not from the theme's own background (`keepBackground: false` already handles that).

- [ ] **Step 5: Commit**

```bash
git add src/components/reading-progress.tsx src/app/blog
git commit -m "feat(blog): tokenise the post layout and add reading progress"
```

---

### Task 20: The gallery and its lightbox

**Files:**
- Create: `src/components/lightbox.tsx`
- Modify: `src/app/gallery/page.tsx` (full rewrite, 62 lines today)
- Modify: `next.config.ts` (allow the placeholder photo host)

**Interfaces:**
- Consumes: `PageHeader`, `Reveal`.
- Produces: `<Lightbox photos={{ src: string; alt: string; width: number; height: number; caption?: string }[]} index: number | null onClose={() => void} onNavigate={(next: number) => void} />` and the gallery route.

- [ ] **Step 1: Allow the placeholder host in `next.config.ts`**

Add one line to `remotePatterns`:

```ts
      { protocol: "https", hostname: "picsum.photos" },
```

- [ ] **Step 2: Write `src/components/lightbox.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";

export type LightboxPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

/**
 * The in-page photo viewer.
 *
 * In-page rather than a route, so no new URL, no new indexed page and no change to the
 * information architecture. Keyboard: Escape closes, the arrows move. Focus is moved into
 * the dialog and returned to whatever opened it, and the background is not reachable while
 * it is open, which is what `aria-modal` promises.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: LightboxPhoto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    const current = index;
    if (current === null) return;
    returnFocusRef.current = document.activeElement;
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate((current + 1) % photos.length);
      if (event.key === "ArrowLeft") onNavigate((current - 1 + photos.length) % photos.length);
      if (event.key === "Tab") {
        // Cycle inside the dialog: the close and arrow buttons, never the page behind it.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      (returnFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [index, onClose, onNavigate, photos.length]);

  if (index === null) return null;
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={photo.caption ?? photo.alt}
        tabIndex={-1}
        className="border-line bg-panel relative max-h-full w-full max-w-4xl overflow-hidden rounded-panel border"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          unoptimized
          className="max-h-[75vh] w-full object-contain"
        />
        {photo.caption && (
          <p className="text-ink-muted px-4 py-3 text-xs">{photo.caption}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="focus-ring bg-surface/80 text-ink absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full"
        >
          <X size={18} weight="regular" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
          aria-label="Previous photo"
          className="focus-ring bg-surface/80 text-ink absolute top-1/2 left-3 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <CaretLeft size={18} weight="regular" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index + 1) % photos.length)}
          aria-label="Next photo"
          className="focus-ring bg-surface/80 text-ink absolute top-1/2 right-3 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <CaretRight size={18} weight="regular" aria-hidden />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/gallery/page.tsx`**

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { GalleryGrid } from "@/components/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery | Francesco Tenace",
  description: "Photographs, mostly of places that needed walking to.",
};

/*
 * Photos live under /public/gallery/. The placeholders below are seeded so every slot
 * renders as a photograph rather than a logo while the real files are collected:
 * replace each entry with `{ src: "/gallery/<name>.jpg", alt: "...", width, height }`
 * and drop the file in. Varied aspect ratios are deliberate: the masonry grid needs them.
 */
const PHOTOS = [
  { src: "https://picsum.photos/seed/ft-coast/1600/1067", alt: "Placeholder photograph", width: 1600, height: 1067 },
  { src: "https://picsum.photos/seed/ft-ridge/1200/1600", alt: "Placeholder photograph", width: 1200, height: 1600 },
  { src: "https://picsum.photos/seed/ft-city/1600/1600", alt: "Placeholder photograph", width: 1600, height: 1600 },
  { src: "https://picsum.photos/seed/ft-desk/1600/900", alt: "Placeholder photograph", width: 1600, height: 900 },
  { src: "https://picsum.photos/seed/ft-rack/1200/1500", alt: "Placeholder photograph", width: 1200, height: 1500 },
  { src: "https://picsum.photos/seed/ft-night/1600/1000", alt: "Placeholder photograph", width: 1600, height: 1000 },
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photographs. Mostly places that needed walking to."
      />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <GalleryGrid photos={PHOTOS} />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Write `src/components/gallery-grid.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";

/**
 * A masonry grid using CSS columns, which is the one layout that keeps mixed aspect
 * ratios honest without a fixed row height.
 *
 * The grid is a client component only because the lightbox needs state; the images
 * themselves are plain `next/image` with `unoptimized` (the export has no optimiser).
 */
export function GalleryGrid({ photos }: { photos: LightboxPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <li key={photo.src} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="focus-ring group border-line block w-full overflow-hidden rounded-panel border"
              aria-label={`Open ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        photos={photos}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={(next) => setOpen(next)}
      />
    </>
  );
}
```

- [ ] **Step 5: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass. The build does not fetch the placeholder photos: `unoptimized` means the browser loads them.

- [ ] **Step 6: Verify keyboard behaviour**

Run `pnpm run dev`, open `/gallery`, Tab to a photo, press Enter, then Escape, then reopen and use the arrow keys.
Expected: focus lands in the dialog, arrows change photo, Escape closes and focus returns to the thumbnail.

- [ ] **Step 7: Commit**

```bash
git add next.config.ts src/components/lightbox.tsx src/components/gallery-grid.tsx src/app/gallery/page.tsx
git commit -m "feat(gallery): masonry grid with an in-page lightbox"
```

---

### Task 21: The music route and its skeleton

**Files:**
- Modify: `src/components/track-list.tsx` (full rewrite, 148 lines today)
- Modify: `src/app/music/page.tsx` (full rewrite, 86 lines today)

**Interfaces:**
- Consumes: `PageHeader`, `Reveal`, `PixelLabel`.
- Produces: `TrackList` keeps its existing public shape: `<TrackList initialTracks={LastFmTrack[]} />`, and `LastFmTrack` keeps its exported type, because `src/app/music/page.tsx` imports both.

- [ ] **Step 1: Rewrite `src/components/track-list.tsx`**

Keep the module's existing logic byte-for-byte: `PAGE_SIZE`, `API_KEY`, `USER`, `trackKey`, `artistName`, `pickImage`, `fetchPage`, the `useState` pages, the `IntersectionObserver` effect and `loadMore`. Only the markup changes: a dense list with album art and a skeleton in place of the spinner.

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MusicNotes, ArrowSquareOut } from "@phosphor-icons/react";

/*
 * Lines 7 to 49 of the current file are unchanged: `LastFmImage`, `LastFmTrack`,
 * `PAGE_SIZE`, `API_KEY`, `USER`, `trackKey`, `artistName`, `pickImage` and `fetchPage`
 * stay byte-for-byte as they are. Keep `export type LastFmTrack`: the music route
 * imports it.
 */

/** A skeleton row shaped like a real row, so loading looks like the content. */
function SkeletonRow() {
  return (
    <li className="border-line flex items-center gap-3 border-b py-3">
      <span className="bg-sunken h-12 w-12 shrink-0 animate-pulse rounded-chip" />
      <span className="flex-1">
        <span className="bg-sunken block h-3.5 w-3/5 animate-pulse rounded" />
        <span className="bg-sunken mt-2 block h-3 w-2/5 animate-pulse rounded" />
      </span>
    </li>
  );
}

export function TrackList({ initialTracks }: { initialTracks: LastFmTrack[] }) {
  const [pages, setPages] = useState<LastFmTrack[][]>([initialTracks]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialTracks.length < PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const nextPageRef = useRef(2);
  const canFetch = Boolean(API_KEY && USER);

  const loadMore = useCallback(async () => {
    if (loading || done || !canFetch) return;
    setLoading(true);
    const next = await fetchPage(nextPageRef.current);
    nextPageRef.current += 1;
    if (next.length === 0) {
      setDone(true);
    } else {
      setPages((prev) => [...prev, next]);
      if (next.length < PAGE_SIZE) setDone(true);
    }
    setLoading(false);
  }, [loading, done, canFetch]);

  useEffect(() => {
    if (!sentinelRef.current || done || !canFetch) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, done, canFetch]);

  const tracks = pages.flat();

  return (
    <>
      <ul className="border-line border-t">
        {pages.flatMap((page, pageIndex) =>
          page.map((track, index) => {
            const image = pickImage(track.image);
            const isNow = track["@attr"]?.nowplaying === "true";
            return (
              <li key={trackKey(track, pageIndex, index)} className="border-line border-b">
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group flex items-center gap-3 py-3"
                >
                  <span className="bg-sunken border-line relative h-12 w-12 shrink-0 overflow-hidden rounded-chip border">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${track.name} cover`}
                        fill
                        sizes="48px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <MusicNotes
                        size={18}
                        weight="regular"
                        aria-hidden
                        className="text-ink-muted absolute inset-0 m-auto"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink group-hover:text-accent block truncate text-sm font-semibold transition-colors">
                      {track.name}
                    </span>
                    <span className="text-ink-muted block truncate text-xs">{artistName(track)}</span>
                  </span>
                  <span className="text-ink-muted tabular hidden shrink-0 font-mono text-xs sm:block">
                    {isNow ? "now playing" : (track.date?.["#text"] ?? "")}
                  </span>
                  <ArrowSquareOut
                    size={14}
                    weight="regular"
                    aria-hidden
                    className="text-ink-muted shrink-0"
                  />
                </a>
              </li>
            );
          }),
        )}
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
      </ul>

      <div ref={sentinelRef} className="text-ink-muted py-6 text-sm">
        {done && tracks.length > 0 && <span>That is the whole history I can fetch.</span>}
      </div>
    </>
  );
}
```

The `Loader2` spinner and the "Scroll for more" label are both gone: a scroll cue is banned by the design rules, and a skeleton communicates the same state better.

- [ ] **Step 2: Rewrite `src/app/music/page.tsx`**

Keep `metadata`, `FALLBACK_ARTISTS`, `RecentTracksResponse`, `INITIAL_PAGE_SIZE` and `fetchInitial()` unchanged. Replace only the returned markup:

```tsx
export default async function MusicPage() {
  const initial = await fetchInitial();

  return (
    <>
      <PageHeader
        eyebrow="now playing"
        title="Music"
        description="Long songs, odd time signatures, and a scrobble feed that predates this site."
      />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        {initial && initial.length > 0 ? (
          <TrackList initialTracks={initial} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {FALLBACK_ARTISTS.map((artist, index) => (
              <Reveal key={artist.name} delay={index * 0.05}>
                <div className="border-line bg-panel h-full rounded-panel border p-5">
                  <div className="flex items-center gap-2">
                    <MusicNotes size={18} weight="regular" aria-hidden className="text-accent" />
                    <h2 className="font-display text-ink text-base font-semibold tracking-tight">
                      {artist.name}
                    </h2>
                  </div>
                  <p className="text-ink-muted mt-2 text-sm leading-relaxed">{artist.note}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
```

Imports: `MusicNotes` from `@phosphor-icons/react/dist/ssr`, `Reveal` from `@/components/reveal`.

- [ ] **Step 3: Run all four commands**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all four pass, and the build still succeeds with no Last.fm variables set (the fallback path).

- [ ] **Step 4: Verify both paths**

Run `pnpm run build` with no variables (fallback artists render), then `NEXT_PUBLIC_LASTFM_USER=... NEXT_PUBLIC_LASTFM_API_KEY=... pnpm run dev` and scroll the list (skeleton appears, rows append).

- [ ] **Step 5: Commit**

```bash
git add src/components/track-list.tsx src/app/music/page.tsx
git commit -m "feat(music): dense scrobble list with a shaped skeleton"
```

---

### Task 22: The homelab route

**Files:**
- Modify: `src/app/homelab/page.tsx` (full rewrite, 220 lines today)
- Modify: `src/components/brand-icon.tsx` only if its colours are hardcoded slate; check first

**Interfaces:**
- Consumes: `PageHeader`, `SpotlightCard`, `Reveal`, `BrandIcon` (existing).
- Produces: the homelab route. The `STACK` and `SERVICES` arrays keep their current contents; the `PHOTOS` array becomes seeded placeholders.

- [ ] **Step 1: Check `brand-icon.tsx` for hardcoded colours**

Run: `grep -n "slate\|#" src/components/brand-icon.tsx`
Expected: if it renders `simple-icons` paths with `fill="currentColor"`, nothing to do. If it hardcodes a slate, replace that with `currentColor` and let the caller set the colour token.

- [ ] **Step 2: Rewrite `src/app/homelab/page.tsx`**

Keep `metadata`, `REPO_URL`, `STACK`, `SERVICES` and the `Service` type as they are, change `PHOTOS` to seeded placeholders, and replace the markup:

```tsx
const PHOTOS = [
  { src: "https://picsum.photos/seed/ft-homelab-rack/1600/1200", alt: "Placeholder rack photograph", width: 1600, height: 1200 },
  { src: "https://picsum.photos/seed/ft-homelab-shelf/1400/1050", alt: "Placeholder shelf photograph", width: 1400, height: 1050 },
];
```

```tsx
export default function HomelabPage() {
  return (
    <>
      <PageHeader
        eyebrow="ssh homelab"
        title="The rack in the corner"
        description="An Odroid HC4 running Arch Linux with a small Docker Compose fleet for DNS, smart home, reverse proxy and media automation. The compose files and non-sensitive config live on GitHub."
      />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <Reveal>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring border-line hover:border-line-strong inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
          >
            <GitBranch size={16} weight="regular" aria-hidden />
            10ax/docker
            <ArrowSquareOut size={14} weight="regular" aria-hidden className="text-ink-muted" />
          </a>
        </Reveal>

        <dl className="mt-10 grid gap-4 md:grid-cols-3">
          {STACK.map(({ icon: Icon, label, value }, index) => (
            <Reveal key={label} delay={index * 0.05}>
              <div className="border-line bg-panel flex h-full items-center gap-3 rounded-panel border p-5">
                <Icon size={20} weight="regular" aria-hidden className="text-accent shrink-0" />
                <div>
                  <dt className="text-ink-muted font-mono text-xs tracking-wide uppercase">{label}</dt>
                  <dd className="text-ink mt-1 text-sm font-medium">{value}</dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>

        <section aria-labelledby="services" className="mt-20">
          <h2 id="services" className="font-display text-ink text-2xl font-semibold tracking-tight">
            What runs on it
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => {
              const Fallback = service.fallbackIcon;
              return (
                <Reveal key={service.name} delay={index * 0.04}>
                  <SpotlightCard className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="border-line bg-sunken flex h-9 w-9 shrink-0 items-center justify-center rounded-chip border">
                          {service.iconSlug ? (
                            <BrandIcon slug={service.iconSlug} className="text-ink h-5 w-5" />
                          ) : (
                            <Fallback size={18} weight="regular" aria-hidden className="text-accent" />
                          )}
                        </span>
                        <h3 className="font-display text-ink text-base font-semibold tracking-tight">
                          {service.name}
                        </h3>
                      </div>
                      {service.url && (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${service.name} homepage`}
                          className="focus-ring text-ink-muted hover:text-accent transition-colors"
                        >
                          <ArrowSquareOut size={16} weight="regular" aria-hidden />
                        </a>
                      )}
                    </div>
                    <p className="text-ink-muted mt-3 text-sm leading-relaxed">{service.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <li
                          key={tag}
                          className="border-line text-ink-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="photos" className="mt-20">
          <h2 id="photos" className="font-display text-ink text-2xl font-semibold tracking-tight">
            The hardware, photographed
          </h2>
          <ul className="mt-8 columns-1 gap-4 sm:columns-2">
            {PHOTOS.map((photo, index) => (
              <li key={photo.src} className="mb-4 break-inside-avoid">
                <Reveal delay={index * 0.05}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="border-line h-auto w-full rounded-panel border"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
```

`SERVICES` has six entries, so the grid has six cells, which is why it is a three-column track with two rows rather than one row of three and a remainder. The services grid is the `SPECIFICALLY` permitted place for `SpotlightCard`, and this is the only section on the whole site that uses it.

- [ ] **Step 3: Run all four commands and commit**

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
git add src/app/homelab/page.tsx src/components/brand-icon.tsx
git commit -m "feat(homelab): spotlight service grid and photo masonry"
```

---

### Task 23: Cross-route view transitions, verified before relied on

**Files:**
- Modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/site-header.tsx` (mark the header as a non-animating element)

**Interfaces:**
- Consumes: everything above.
- Produces: route-change transitions, or an explicit removal of the flag if the export cannot support it. This task's deliverable is a **decision plus its evidence**, not a feature. If the check fails, the flag is removed and the task still completes.

- [ ] **Step 1: Read the vendored guide first**

Read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` (it is vendored for this exact reason) and confirm the export name for the React component in this version: it may be `ViewTransition` or `unstable_ViewTransition`.

- [ ] **Step 2: Enable the flag**

```ts
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  experimental: {
    // Verified against `output: "export"` before being kept: see
    // docs/TROUBLESHOOTING.md. If a build ever fails on this, remove it rather than
    // working around it.
    viewTransition: true,
  },
  images: {
```

- [ ] **Step 3: Wrap the chrome in `layout.tsx`**

```tsx
import { ViewTransition } from "react";
```

```tsx
        <SkipLink />
        <SiteHeader />
        <ViewTransition>{children}</ViewTransition>
        <SiteFooter />
```

- [ ] **Step 4: Keep the header out of the animation**

The header is persistent chrome, so animating it on every navigation reads as a glitch. In `site-header.tsx`, add the name the guide documents:

```tsx
    <header
      style={{ viewTransitionName: "site-header" }}
      className="border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur"
    >
```

and suppress its animation in `globals.css`:

```css
::view-transition-group(site-header) {
  animation: none;
}
```

- [ ] **Step 5: Run the verification that decides whether this stays**

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
ls out/index.html out/cv/index.html out/blog/index.html
```

Then, with `pnpm run dev`:
1. Disable JavaScript in the browser and navigate between `/`, `/cv` and `/blog`. Every page must render fully.
2. With JavaScript on, navigate between routes and confirm the transition plays and does not leave a blank frame.
3. Confirm `prefers-reduced-motion: reduce` removes the animation.

Expected: all three hold. If step 1 or 2 fails, remove `experimental.viewTransition`, remove the `<ViewTransition>` wrapper and the `viewTransitionName` style, and record the failure and the reason in `docs/TROUBLESHOOTING.md`. A failed check ends this task with the feature removed; that is a successful outcome, not an incomplete one.

- [ ] **Step 6: Commit**

```bash
git add next.config.ts src/app/layout.tsx src/components/site-header.tsx src/app/globals.css docs/TROUBLESHOOTING.md
git commit -m "feat(nav): crossfade route changes, or document why not"
```

---

### Task 24: Pre-flight audit and documentation

**Files:**
- Modify: `docs/TROUBLESHOOTING.md`
- Modify: `README.md` and `CLAUDE.md` **only inside the `autodoc` markers**
- Modify: `docs/redesign/2026-10-12-home-hub-redesign-design.md` (mark the accepted deviations as shipped)

**Interfaces:**
- Consumes: every task above.
- Produces: the audit record. This task ships no product code; it is the gate the whole redesign passes through.

- [ ] **Step 1: Run the mechanical checks from the design skill**

```bash
# Eyebrows: at most one per three sections, per page.
grep -rc "<PixelLabel" src/app src/components | grep -v ":0"

# No em-dash or en-dash in any user-visible source string.
grep -rn "—\|–" src/app src/components | grep -v "\.test\."

# No scroll listeners anywhere.
grep -rn "addEventListener(\"scroll\"\|addEventListener('scroll'" src || echo clean

# No three-equal-card row: a bare `md:grid-cols-3` with three identical children.
grep -rn "grid-cols-3" src/app src/components

# Every colour in a component comes from a token.
grep -rn "#[0-9a-fA-F]\{6\}\|bg-slate-\|text-slate-\|border-slate-" src/app src/components || echo "tokens only"

# Icons: one family, no hand-rolled SVG paths.
grep -rn "lucide" src || echo clean
grep -rln "<path d=" src/components | grep -v brand-icon || echo clean
```

Expected: one `PixelLabel` per page at most; zero em-dashes in `src/app` and `src/components`; no scroll listeners; every `grid-cols-3` track carries five or more cells with an explicit span on one of them, so no row is three identical cards; no hardcoded colours; no Lucide; no hand-rolled paths outside `brand-icon.tsx` (which renders Simple Icons paths).

- [ ] **Step 2: Record the audit honestly in the design doc**

Append to the spec, under section 12:

```markdown
### Audit record, 2026-10-12

- Eyebrow counts per route: recorded above per page.
- Em-dash sweep: zero in `src/app` and `src/components`; the three published posts keep
  theirs, as agreed.
- Reduced motion: verified on the starfield, the sprite, the reveals, the spotlight and
  the reading progress bar.
- Both themes: every route opened in light and dark.
- View transitions: enabled or removed, with the reason recorded in TROUBLESHOOTING.
```

- [ ] **Step 3: Add the operational entries to `docs/TROUBLESHOOTING.md`**

```markdown
## The redesign's moving parts

- **The sprite is generated, not hand-edited.** `public/sprites/*.png` are compiled from
  `src/sprites/trainer.ts` by `pnpm run build:sprite`. Editing a PNG by hand is lost work:
  edit the grid, re-run the script, commit both. The script refuses to write a sheet whose
  grid fails `validateSheet`.
- **The three states are one strip each.** A strip's width is its frame count times the
  cell width at 4x, and the keyframes in `globals.css` hardcode those widths (128px for
  `idle` and `interact`, 256px for `walk`). Changing the frame count or the cell size means
  changing the keyframes in the same commit.
- **The CV lives on `/cv`.** The home page is a hub. If a link to the CV is missing
  somewhere it used to be, that is the expected shape of the change, not a regression.
- **`/cv` is pinned in `tests/metadata-routes.test.ts`** as one of six static routes. That
  test is deliberately brittle: adding a route without adding it to the sitemap fails it.
```

- [ ] **Step 4: Update the generated prose, inside the markers only**

In `README.md` and `CLAUDE.md`, update the text that sits **between** `<!-- autodoc:begin -->` and `<!-- autodoc:end -->` to match the new reality: the home page is a hub rather than a CV, `/cv` is the CV route, the sprite and the token layer exist, `pnpm run build:sprite` exists. Do not touch a single byte outside the marker pair. If the autodoc lane regenerates these files later, that is expected and fine.

- [ ] **Step 5: Run everything one final time, in the order CI runs it**

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```
Expected: all pass, with no environment variables set.

- [ ] **Step 6: Check the export's shape**

```bash
ls out/index.html out/cv/index.html out/gallery/index.html out/music/index.html out/homelab/index.html out/blog/index.html out/404.html out/sitemap.xml out/robots.txt
ls out/sprites/
grep -c "cv" out/sitemap.xml
```
Expected: every file listed exists, six sprite PNGs, and the sitemap mentions `/cv`.

- [ ] **Step 7: Commit**

```bash
git add docs README.md CLAUDE.md
git commit -m "docs(redesign): record the audit and the new operational shape"
```

---

## Self-review

**Spec coverage.** Every numbered section of the spec maps to at least one task: 2 (constraints) to the Global Constraints block; 3 (IA, SEO, test impact) to Tasks 3, 17; 4.1 tokens to Task 1; 4.2 type to Tasks 1, 6; 4.3 shape and layers to Tasks 1, 4; 4.4 motion to Tasks 7, 8, 12, 17, 19; 5 sprite to Tasks 9, 10, 11; 6.1 hub to Tasks 13, 14, 15; 6.2 `/cv` to Tasks 16, 17; 6.3 and 6.4 blog to Tasks 18, 19; 6.5 gallery to Task 20; 6.6 music to Task 21; 6.7 homelab to Task 22; 6.8 404 to Task 6; 7 components to the tasks that create each file; 8 dependencies to Tasks 5, 7; 9 content rules to the Global Constraints plus Tasks 2, 15, 17, 24; 10 verification to each task's command block plus Tasks 23 and 24; 11 slices to the task order; 12 trade-offs to Tasks 17 and 24; 13 waiting-on-owner items are the two `TODO` comments in Tasks 14 and 22 plus Task 20's photo array.

**Placeholder scan.** The plan contains two deliberate `TODO` comments, both for owner-supplied assets (the rack photograph, the gallery photographs). They are marked as asset slots with a file path and a replacement instruction, which is the skill's documented "last resort" for missing images, not an unfinished step. No step says "handle edge cases", "add validation", or "similar to Task N".

**Type consistency.** `SpriteState` is declared once in `src/sprites/sheet.ts` and imported by `sprite.tsx` and `png.ts`. `SpriteSheet` is declared once and imported by `trainer.ts`. `FrameRef` is declared once, used by `sheet.ts`, `png.ts` and `trainer.ts` with the same `frame`/`dx`/`dy` names. `Experience` and `Skill` are declared in `src/lib/cv-data.ts` and imported by the CV page and `experience-stack.tsx`. `NAV_LINKS` and `CONTACT_LABEL` are declared in `src/lib/nav.ts` and imported, never re-declared. `LightboxPhoto` is declared in `lightbox.tsx` and imported by `gallery-grid.tsx`. `Reveal` takes `children`, `delay`, `className` in every call site.

**Review Focus.** All five lines have an owning test or verification step: the pre-paint theme (Task 2), the 404 (Tasks 6 and 24), a malformed sprite grid (Task 9's two `validateSheet` cases), reduced motion (Tasks 7, 12, 23, 24), and the CV's facts after the move (Tasks 16 and 17).


