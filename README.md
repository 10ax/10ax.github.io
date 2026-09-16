<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->

# 10ax.github.io

Francesco Tenace's personal site: a CV landing page, an MDX blog, a Last.fm-backed music
page, a homelab page and a photo gallery. Next.js App Router, statically exported, served
from GitHub Pages at <https://10ax.github.io>.

It exists to be a single, self-owned page that a recruiter, a reader and a search engine
can all use — which is why the CV lives in the markup as JSON-LD rather than in a PDF, and
why the whole thing is a static export with no server to keep alive.

## Quickstart

Requires **Node 20** — that is what both GitHub Actions workflows use, and a newer major
will not reproduce their results.

```bash
npm ci --ignore-scripts   # install exactly what package-lock.json pins
npm run dev               # http://localhost:3000
```

The full check suite, in the order CI runs it:

```bash
npm run lint      # eslint, via eslint-config-next
npx tsc --noEmit  # type-check
npm test          # vitest run
npm run build     # static export into ./out/
```

`npm run build` needs no environment variables. `NEXT_PUBLIC_SITE_URL` falls back to
`https://10ax.github.io`, and `/music` falls back to a hard-coded artist list when no
Last.fm credentials are present.

## Layout

```
content/blog/*.mdx          the blog posts — frontmatter is read at build time
src/app/                    App Router routes: /, /blog, /blog/[slug], /gallery,
                            /music, /homelab, plus sitemap.ts, robots.ts and the
                            two opengraph-image.tsx handlers
src/components/             site chrome, plus the client-side Last.fm track list
src/lib/posts.ts            MDX loading and frontmatter parsing
src/lib/site-url.ts         resolves the absolute origin used in all metadata
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

`npm test` runs a characterisation suite — it pins down what the code does **today**, so
that a change which alters it is visible rather than silent. It covers the three places
where a mistake becomes a failed deploy or a wrong link:

- `tests/posts.test.ts` — frontmatter parsing, date normalisation, slug derivation,
  sorting, and the malformed-YAML failure that breaks `npm run build`.
- `tests/site-url.test.ts` — origin resolution and its fallbacks.
- `tests/metadata-routes.test.ts` — the exact contents of `sitemap.xml` and `robots.txt`.
- `tests/content-blog.test.ts` — the real posts in `content/blog/`, so a bad post fails a
  test before it fails a deploy.

There are no component tests and no network tests; `docs/TROUBLESHOOTING.md` explains why
under "Known issues".

## State of the repo

What works: the home page, the blog (index, post pages, syntax highlighting, per-post
OpenGraph images), `/homelab`, `sitemap.xml`, `robots.txt`, and the deploy workflow.

What is half-done:

- `/gallery` and the "Rack photos" section of `/homelab` still display the stock
  `next.svg` and `vercel.svg` logos instead of real images. Neither `public/gallery/` nor
  `public/homelab/` exists.
- The "Download CV" button and the location pill on the home page are both `href="#"`.
  There is no CV file in `public/`.
- `DEPLOY.md` documents the wrong names for the Last.fm repository secrets; the workflow
  is the source of truth.

Nothing is dead code. The full list, with the file and commit that proves each one, is the
"Known issues" section of `docs/TROUBLESHOOTING.md`.

## Stack

Next.js 16.2.6 (App Router, Turbopack, `output: "export"`) · React 19.2.4 · TypeScript 5
(strict) · Tailwind CSS v4 · MDX via `next-mdx-remote` and `gray-matter` ·
`rehype-pretty-code` + Shiki · `lucide-react` and `simple-icons` · Vitest 3 · npm.

<!-- autodoc:end -->
