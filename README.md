<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->

# 10ax.github.io

Francesco Tenace's personal site: a hub that links to the CV, an MDX blog, a Last.fm-backed
music page, a homelab page and a photo gallery. The home page is a hub rather than the CV
itself; the CV lives at `/cv`. Next.js App Router, statically exported, served from GitHub
Pages at <https://10ax.github.io>.

It exists to be a single, self-owned page that a recruiter, a reader and a search engine
can all use — which is why the CV facts are in the markup as JSON-LD rather than in a PDF,
and why the whole thing is a static export with no server to keep alive.

## Quickstart

Requires **Node 22** — the version in `.node-version`, which both GitHub Actions
workflows read. It is a floor, not a preference: pnpm 11 refuses to start on anything
below Node 22.13.

```bash
pnpm install --frozen-lockfile --ignore-scripts   # install exactly what pnpm-lock.yaml pins
pnpm run dev               # http://localhost:3000
```

The full check suite, in the order CI runs it:

```bash
pnpm run lint      # eslint, via eslint-config-next
pnpm exec tsc --noEmit  # type-check
pnpm test          # vitest run
pnpm run build     # static export into ./out/
```

`pnpm run build` needs no environment variables. `NEXT_PUBLIC_SITE_URL` falls back to
`https://10ax.github.io`, and `/music` falls back to a hard-coded artist list when no
Last.fm credentials are present.

`pnpm run build:sprite` compiles the pixel grids under `src/sprites/` into
`public/sprites/*.png`. The PNGs are generated, not hand-edited: change the grid, re-run the
script, and commit both.

## Layout

```
content/blog/*.mdx          the blog posts — frontmatter is read at build time
src/app/                    App Router routes: / (the hub), /cv, /blog, /blog/[slug],
                            /gallery, /music, /homelab, plus sitemap.ts, robots.ts,
                            not-found.tsx and the two opengraph-image.tsx handlers
src/components/             site chrome, the scene, and the client-side Last.fm track list
src/lib/posts.ts            MDX loading and frontmatter parsing
src/lib/site-url.ts         resolves the absolute origin used in all metadata
src/lib/theme.ts            the pre-paint theme script, its storage key and attribute
src/lib/nav.ts              the six nav links, shared by header, footer and drawer
src/lib/cv-data.ts          the CV facts and the contact address, imported rather than re-declared
src/lib/lastfm.ts           the Last.fm response types, request URL and image rule, shared
                            by the hub, the music route and the client-side scroller
src/sprites/                the pixel grids the sprite PNGs are generated from
scripts/build-sprite.ts     `pnpm run build:sprite` — compiles the grids to public/sprites/
tests/                      vitest suite (see below)
docs/TROUBLESHOOTING.md     what to read when a build goes red
DEPLOY.md                   Pages setup, custom domains, project-site migration
.github/workflows/          deploy.yml (publishes) and ci.yml (checks only)
```

## How it is deployed

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to
`master`, on manual dispatch, and **hourly on a cron** so the `/music` page picks up new
scrobbles without a commit. It is the only workflow allowed to deploy; `ci.yml` is a
checks-only sibling that holds no secrets and never joins the `pages` concurrency group.

The repository name matters: Pages only serves this from the domain root because the repo
is called `10ax.github.io`. Renaming it turns the site into a path-prefixed project site
and breaks every absolute link, because `next.config.ts` sets no `basePath`. `DEPLOY.md`
covers the migration if that is ever wanted.

## Tests

`pnpm test` runs a characterisation suite — it pins down what the code does **today**, so
that a change which alters it is visible rather than silent. It covers the places where a
mistake becomes a failed deploy, a wrong link or a broken sprite:

- `tests/posts.test.ts` — frontmatter parsing, date normalisation, slug derivation,
  sorting, and the malformed-YAML failure that breaks `pnpm run build`.
- `tests/site-url.test.ts` — origin resolution and its fallbacks.
- `tests/metadata-routes.test.ts` — the exact contents of `sitemap.xml` and `robots.txt`,
  including the six static routes and the `/cv` entry.
- `tests/content-blog.test.ts` — the real posts in `content/blog/`, so a bad post fails a
  test before it fails a deploy.
- `tests/design-tokens.test.ts` — the light and dark token blocks stay in parity, and every
  colour token reaches Tailwind through `@theme inline`.
- `tests/sprite-sheet.test.ts` and `tests/png.test.ts` — every grid row is the same length,
  every palette index is in range, and the dependency-free PNG writer emits valid chunks.
- `tests/theme.test.ts`, `tests/nav.test.ts`, `tests/cv-data.test.ts` and
  `tests/icons.test.ts` — the pre-paint script, the six nav links and their order, the CV
  facts after the move to `/cv`, and the icon family.
- `tests/source-prose.test.ts` — the brief's prose rule: no em-dash or en-dash in a
  user-visible string anywhere under `src/app`, `src/components` or `src/lib` (comments are
  excluded; `src/lib/posts.ts` documents with them in JSDoc).

There are no component tests and no network tests; `docs/TROUBLESHOOTING.md` explains why
under "Known issues".

## State of the repo

What works: the hub home page (the scene hero, the sprite and the destination menu), `/cv`,
the blog (index, post pages, syntax highlighting, per-post OpenGraph images), `/gallery`,
`/homelab`, `/music`, `sitemap.xml`, `robots.txt`, the theme toggle and the deploy workflow.

What is half-done:

- `/gallery` and the "Rack photos" section of `/homelab` render placeholder photographs
  hot-linked from `picsum.photos` (plus `public/homelab/rack-placeholder.svg`) until the real
  files are collected. The comment above the array writes to `public/gallery/`, which does
  not exist yet.
- The CV PDF for `public/` has not landed, so `/cv` carries no download link yet.
- `DEPLOY.md` documents the wrong names for the Last.fm repository secrets; the workflow
  is the source of truth.

Nothing is dead code. The full list, with the file and commit that proves each one, is the
"Known issues" section of `docs/TROUBLESHOOTING.md`.

## Stack

Next.js 16.2.6 (App Router, Turbopack, `output: "export"`) · React 19.2.4 · TypeScript 5
(strict) · Tailwind CSS v4 with a light/dark token layer · MDX via `next-mdx-remote` and
`gray-matter` · `rehype-pretty-code` + Shiki · `motion` for animation ·
`@phosphor-icons/react` and `simple-icons` · Vitest 3 · pnpm.

<!-- autodoc:end -->
