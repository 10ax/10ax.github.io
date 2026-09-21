@AGENTS.md
<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->
---

# Working in this repo

Personal portfolio and blog. Next.js App Router, **statically exported** to GitHub Pages.
There is no server and no runtime: everything is decided at build time, so almost every
mistake surfaces as a failed `pnpm run build` rather than a runtime error.

## Stack and pinned versions

| | |
|---|---|
| Next.js | `16.2.6` (App Router, Turbopack, `output: "export"`) |
| React | `19.2.4` |
| TypeScript | `^5`, `strict: true`, path alias `@/*` → `./src/*` |
| Node | **20** — both workflows pin it; local machines may be newer |
| Package manager | pnpm, with a committed `pnpm-lock.yaml` |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` |
| MDX | `gray-matter` frontmatter + `next-mdx-remote/rsc` |
| Highlighting | `rehype-pretty-code` + `shiki` |
| Icons | `lucide-react`, `simple-icons` |
| Tests | Vitest `^3.2.7` — the pin predates Node 22 and pnpm; nothing blocks a bump now, but nobody has done it |

## Commands

```bash
pnpm install --frozen-lockfile --ignore-scripts   # install; never run lifecycle scripts in a worktree
pnpm run dev               # dev server on :3000
pnpm run lint              # eslint
pnpm exec tsc --noEmit          # type-check
pnpm test                  # vitest run  (same as: pnpm exec vitest run)
pnpm run build             # static export into ./out/
```

All five of the non-dev commands must pass before anything is committed. They are exactly
what `.github/workflows/ci.yml` runs, in that order.

## Invariants

- **`output: "export"` is not negotiable.** No route may need a request at runtime: no
  Route Handlers, no Server Actions, no `dynamic = "force-dynamic"`, no middleware,
  no `next/image` optimizer. Every metadata route (`sitemap.ts`, `robots.ts`, both
  `opengraph-image.tsx`) must keep `export const dynamic = "force-static"`.
- **The build must succeed with no environment variables set.** CI deliberately supplies
  none. `src/lib/site-url.ts` falls back to `https://10ax.github.io`, and `/music` falls
  back to a static artist list without Last.fm credentials. Do not introduce a build-time
  dependency on a secret.
- **`deploy.yml` is the only workflow that deploys.** It owns `concurrency: group: pages`
  with `cancel-in-progress: false` so the hourly `/music` cron can finish. Never add a
  second deploying workflow, and never put another workflow in the `pages` group —
  commit `c251501` had to delete a duplicate that was doing exactly that.
- **The repository must stay named `10ax.github.io`.** Any other name makes Pages serve a
  path-prefixed project site, and `next.config.ts` sets no `basePath`/`assetPrefix`, so
  every absolute URL breaks.
- **Only read-only, public values may carry the `NEXT_PUBLIC_` prefix.** Those are inlined
  into the client bundle. The Last.fm *API key* is fine there by design; the Last.fm
  *shared secret* must never appear.
- **`content/blog/*.mdx` frontmatter is parsed at build time.** One malformed file fails
  the whole build — `getAllPosts()` reads every post in a single `Promise.all`.

## Conventions visible in the code

- Explicit return types on exported functions; no `any` (use `unknown` and narrow).
- `import type` for type-only imports, kept separate from runtime imports.
- JSDoc on exported APIs; comments explain *why*, not *what*.
- Route files export a `metadata` object; page components are the default export.
- Page content is declared as a typed `const` array at the top of the file
  (`SERVICES`, `PHOTOS`, `NAV_LINKS`, `CV_DATA`) and mapped in the JSX below.
- Tailwind classes only — there are no CSS modules and no styled-components.
- Tests live in `tests/*.test.ts`, import through the `@/` alias, and are
  *characterisation* tests: they pin current behaviour, including behaviour that is
  wrong. When you find wrongness, write the test that captures it and add it to the
  Known issues section of `docs/TROUBLESHOOTING.md` — do not quietly fix it.

## Gotchas the history already paid for

- Line numbers in code fences must use `content-[counter(line)]`, never
  `[content:counter(line)]` — Tailwind's `before:*` utilities re-emit
  `content: var(--tw-content)` and clobber a raw declaration (commit `951770d`).
  The selectors also scope to `code[data-line-numbers]`, not `pre`.
- The deploy workflow reads `secrets.NEXT_PUBLIC_LASTFM_API_KEY` and
  `secrets.NEXT_PUBLIC_LASTFM_USER` — both *secrets*, both prefixed (commit `9f59b07`).
  `DEPLOY.md` still documents the older `vars.LASTFM_USER` / `secrets.LASTFM_API_KEY`
  names and is wrong; trust the workflow.
- The default branch is `master`, not `main` (commits `eecc69e`, `296e62c`).
- `gray-matter` memoises by content string, and a throwing parse leaves a poisoned entry
  behind: the same bytes parsed twice in one process return empty frontmatter instead of
  throwing again. Never share a malformed fixture between two tests.
- Unquoted frontmatter dates carrying a time and zone offset shift into UTC and can move
  by a day. Write `date: 2026-05-31` and nothing more.

## What not to touch

- `AGENTS.md` — hand-curated, carries a generated Next.js block. Leave it alone.
- The first line of this file (`@AGENTS.md`) — it is the include that pulls AGENTS.md in.
- `.github/workflows/deploy.yml` — the publishing pipeline. Extend `ci.yml` instead.
- `.github/copilot-instructions.md` and `.github/instructions/**` — the owner's
  instruction set for other tools.
- `DEPLOY.md` — human-written operational documentation. Its one stale table is recorded
  in `docs/TROUBLESHOOTING.md` rather than edited.
- `public/.nojekyll` — without it Pages runs Jekyll over the export and drops `_next/`.
- Generated prose in Markdown files belongs strictly between the `autodoc:begin` and
  `autodoc:end` HTML comments. Never edit a byte outside that pair — that includes
  reflowing, reordering or "improving" the human text around it.

## Where to start

`docs/TROUBLESHOOTING.md` is the operating guide — symptom, check, cause, fix — and its
final section lists everything known to be broken or half-finished.
`.claude/skills/` holds the repeatable workflows: publishing a post, changing the site
origin, and diagnosing a red deploy.
<!-- autodoc:end -->
