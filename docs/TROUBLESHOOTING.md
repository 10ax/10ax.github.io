<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->

# Troubleshooting

The site is a static export. Almost everything that goes wrong goes wrong at **build
time**, on a GitHub runner, and shows up as a red `Deploy to GitHub Pages` run — not as a
runtime error you can attach a debugger to. Start with the failing step's log, then find
the symptom below.

Every command here exists in this repo. Run them from the repository root.

## First moves

```bash
pnpm install --frozen-lockfile --ignore-scripts   # exact dependency tree from pnpm-lock.yaml
pnpm run lint              # eslint
pnpm exec tsc --noEmit          # type-check
pnpm exec vitest run            # the test suite (also: pnpm test)
pnpm run build             # the static export, into ./out/
```

If all five are green locally and CI is red, the difference is almost always the Node
major version or a missing repository variable — see the first two entries.

---

### Symptom — CI passes on your machine but the deploy build fails

**Check:**

```bash
node --version                                   # what you are running
grep -n 'node-version' .github/workflows/*.yml   # what the runners use
```

**Cause:** both `.github/workflows/deploy.yml` and `.github/workflows/ci.yml` pin
`node-version: 20`. A developer machine on Node 22 (or newer) resolves optional
dependencies and native bindings differently, so a green local run does not prove the
deploy will be green.

**Fix:** reproduce on Node 20 before chasing anything else — `nvm use 20 && pnpm install --frozen-lockfile
--ignore-scripts && pnpm run build`. Keep both workflows on the same major; if you raise
one, raise the other in the same commit. Note that `vitest` is pinned to the 3.x line
precisely because it still supports Node 20; vitest 4 drops Node 18 and vitest 5 requires
Node 22.12+, so neither can run on the deploy runner as configured.

---

### Symptom — the `/music` page shows four fallback artists instead of scrobbles

**Check:**

```bash
grep -rn 'NEXT_PUBLIC_LASTFM' .github/workflows/deploy.yml src/
```

**Cause:** `src/app/music/page.tsx` calls `fetchInitial()`, which returns `null` the
moment either `NEXT_PUBLIC_LASTFM_API_KEY` or `NEXT_PUBLIC_LASTFM_USER` is missing — and
also when Last.fm answers with a non-2xx status or invalid JSON. The page then renders the
hard-coded `FALLBACK_ARTISTS` list. `src/components/track-list.tsx` reads the same two
variables and disables its infinite scroll without them.

**Fix:** this is working as designed, and the build **must** keep succeeding without those
variables — `.github/workflows/ci.yml` deliberately provides no secrets, so a build that
started requiring a Last.fm key would break CI. To get live scrobbles on the deployed site,
set both values in **Settings → Secrets and variables → Actions** as repository *secrets*
named exactly `NEXT_PUBLIC_LASTFM_API_KEY` and `NEXT_PUBLIC_LASTFM_USER`, then re-run the
deploy workflow. Do not commit them: `NEXT_PUBLIC_*` values are inlined into the public
JavaScript bundle by design, so only a read-only Last.fm API key belongs here — never the
Last.fm shared secret.

---

### Symptom — the deployed site 404s on every asset, or links point at the wrong host

**Check:**

```bash
grep -n 'FALLBACK_SITE_URL' src/lib/site-url.ts
grep -n 'basePath\|assetPrefix\|trailingSlash' next.config.ts
```

**Cause:** this is a GitHub Pages **user site**, which is only served from the domain root
when the repository is named exactly `<username>.github.io`. Rename the repository to
anything else and Pages serves it as a *project site* under `/<repo>/`, while
`next.config.ts` sets no `basePath` and no `assetPrefix` — so every absolute path emitted
by Next.js (`/_next/...`, `/blog/...`) resolves one level too high and 404s.

**Fix:** keep the repository named `<username>.github.io`. If you genuinely want a project
site, you must set both `basePath` and `assetPrefix` in `next.config.ts` and update the
`NEXT_PUBLIC_SITE_URL` repository variable in the same change — `DEPLOY.md` has the exact
snippet under "Migrating to a project site".

---

### Symptom — two Pages deployments fight, or a deploy is stuck "queued"

**Check:**

```bash
ls .github/workflows/
grep -n -A 3 'concurrency' .github/workflows/*.yml
```

**Cause:** `deploy.yml` owns publishing. It uses `concurrency: group: pages` with
`cancel-in-progress: false`, deliberately, so that the **hourly cron** that refreshes
`/music` is allowed to finish rather than being cancelled by the next push. Any second
workflow that publishes to Pages, or that joins the `pages` group, will serialise behind it
or cancel it. The repository has been here before: commit `c251501` ("delete duplicate
workflow") removed a leftover `jekyll-gh-pages.yml` that was deploying alongside this one.

**Fix:** keep exactly one deploying workflow. `ci.yml` is a checks-only sibling — it has
`permissions: contents: read`, produces no Pages artifact, and uses its own concurrency
group (`ci-${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`). Never
move it into the `pages` group and never add `actions/deploy-pages` to it.

---

### Symptom — `pnpm run build` fails with a YAMLException naming a blog post

**Check:**

```bash
pnpm exec vitest run tests/content-blog.test.ts
```

**Cause:** `src/lib/posts.ts` parses the frontmatter of every file in `content/blog/` at
build time, via `gray-matter`. Malformed YAML — an unterminated quote, an unclosed `[`, a
tab used for indentation — throws, and because `getAllPosts()` reads every post with a
single `Promise.all`, one bad file fails the entire build. The blog index, each post page,
`generateStaticParams`, `generateMetadata` and `sitemap.xml` all depend on it.

**Fix:** run the test above; it reads the real `content/blog/` directory and fails with the
offending slug before you ever reach a build. Then fix the frontmatter. The required shape
is four keys between `---` fences:

```yaml
---
title: A title
date: 2026-05-31
description: One sentence.
tags: [one, two]
---
```

Watch for the silent failures too — they do not throw, so only
`tests/content-blog.test.ts` catches them: a missing or non-string `date` (e.g. `date:
2026`) is quietly replaced with *today*, and a `tags:` value that is not a YAML list (e.g.
`tags: meta`) is quietly dropped.

---

### Symptom — a malformed post throws once, then seems to parse fine

**Check:**

```bash
pnpm exec vitest run tests/posts.test.ts -t "throws only on the first parse"
```

**Cause:** `gray-matter` memoises by content string, and a parse that throws still leaves
an entry behind in that cache. Parsing the identical bytes again in the same process
returns empty frontmatter instead of throwing a second time.

**Fix:** harmless in a real build — each file is parsed once, and the first throw aborts
everything. It matters when writing tests: never share a malformed fixture between two
test cases, or the second one will silently get an empty result. `tests/posts.test.ts`
uses a distinct malformed body per test for exactly this reason.

---

### Symptom — a post's date is off by one day

**Check:**

```bash
pnpm exec vitest run tests/posts.test.ts -t "shifts a zone-offset datetime"
grep -n '^date:' content/blog/*.mdx
```

**Cause:** `normalizeDate()` in `src/lib/posts.ts` converts a YAML date to UTC and takes
the first ten characters. An unquoted date with a time and a zone offset — `date:
2026-05-31 23:00:00 -05:00` — becomes `2026-06-01`.

**Fix:** write dates as a bare `date: 2026-05-31`, with no time and no offset. Those are
parsed at UTC midnight and survive the conversion unchanged.

---

### Symptom — code blocks in a post lose their line numbers or highlight the wrong rows

**Check:**

```bash
grep -n 'line-numbers' 'src/app/blog/[slug]/page.tsx'
```

**Cause:** `rehype-pretty-code` puts `data-line-numbers` on the `<code>` element, not the
`<pre>`, so the Tailwind selectors have to be scoped to `code[data-line-numbers]` rather
than `&[...]`. There is a second trap recorded in commit `951770d`: the counter must be
emitted with `content-[counter(line)]` (which sets `--tw-content`) and **not**
`[content:counter(line)]` — every `before:*` utility re-emits `content: var(--tw-content)`,
so a raw `content` declaration gets clobbered by whichever `before:` rule Tailwind emits
last.

**Fix:** edit the `pre` entry in `mdxComponents` in `src/app/blog/[slug]/page.tsx`; the
comments above each selector explain what they target. Enable numbering per fence with
` ```ts showLineNumbers `.

---

### Symptom — the build hangs or fails while resolving fonts

**Check:**

```bash
grep -n 'next/font/google' src/app/layout.tsx
```

**Cause:** `src/app/layout.tsx` loads `Geist` and `Geist_Mono` through `next/font/google`.
Next.js downloads those font files at build time and caches them under `.next/cache`. On a
cold cache with no outbound network — an offline machine, a locked-down runner — there is
nothing to fall back to.

**Fix:** build with network access, or reuse a warm `.next/cache`. `deploy.yml` already
caches `${{ github.workspace }}/.next/cache` via `actions/cache@v4`, which is why the
hourly cron runs do not re-download the fonts.

---

### Symptom — social previews show no image, or the image downloads instead of rendering

**Check:**

```bash
pnpm run build && find out -name 'opengraph-image*'
```

**Cause:** the OpenGraph routes are `.tsx` handlers, so the export writes
`out/opengraph-image` and `out/blog/<slug>/opengraph-image` — valid PNG bytes with no
`.png` extension. GitHub Pages serves them as `application/octet-stream`.

**Fix:** nothing, in practice: the crawlers sniff the bytes and the `og:image:type` meta
tag advertises `image/png`. `DEPLOY.md` documents the escape hatch (commit literal
`opengraph-image.png` files under `src/app/`) if a strict `Content-Type` ever becomes
necessary.

---

### Symptom — `npm install` crashes with "Cannot read properties of null (reading 'edgesOut')"

Historical. This repo moved to pnpm, which does not use npm's arborist resolver, so the
crash cannot occur here any more. The entry stays because it is the reason `vitest` is
pinned at `^3.2.7`.

**Cause:** an arborist bug in npm 10.9.2 (the version bundled with Node 22.16) when
resolving a package that declares optional peer dependencies on packages that are not
installed. It was hit while adding `vitest` — versions 4 and 5 both trip it; 3.x does not.

**Consequence today:** the reason for the `vitest` 3.x pin is gone. Bumping it is a
deliberate change, not a side effect of the package-manager switch, so the pin stands
until someone upgrades it and runs the suite.

---

### Symptom — a page renders locally but is missing from the export

**Check:**

```bash
grep -rn 'force-static' src/app/
pnpm run build && find out -maxdepth 2 -name 'index.html'
```

**Cause:** `next.config.ts` sets `output: "export"`. Every metadata route
(`src/app/sitemap.ts`, `src/app/robots.ts`, both `opengraph-image.tsx` files) must declare
`export const dynamic = "force-static"` or the export refuses to emit it. Any route that
needs a request at runtime cannot exist in this project at all.

**Fix:** add the `force-static` export to the route. `tests/metadata-routes.test.ts`
asserts it is present on `sitemap` and `robots`, so a regression there shows up as a test
failure rather than a missing file.

---

## Known issues

Things that are broken, stale, or half-finished as of `cd2f189`. None of them were fixed
while writing this guide; they are recorded so the next person does not rediscover them.

- **`DEPLOY.md` documents the wrong names for the Last.fm variables.** Step 3 of its
  setup table asks for a *variable* `LASTFM_USER` and a *secret* `LASTFM_API_KEY`. Commit
  `9f59b07` changed `deploy.yml` to read `secrets.NEXT_PUBLIC_LASTFM_API_KEY` and
  `secrets.NEXT_PUBLIC_LASTFM_USER` — both secrets, both `NEXT_PUBLIC_`-prefixed — and
  `DEPLOY.md` was never updated. Following that table produces a site with no scrobbles and
  no error. The workflow is the source of truth.

- **`resolveSiteUrl` mangles any scheme that is not http(s).** `src/lib/site-url.ts`
  prepends `https://` only when the value does not already start with `http://` or
  `https://`, so `ftp://x.com` becomes `https://ftp//x.com` instead of being rejected for
  the fallback. Pinned by `tests/site-url.test.ts`; harmless today because the only value
  ever supplied is an https origin.

- **Bad frontmatter dates and tags fail silently.** `src/lib/posts.ts` replaces a missing
  or non-string `date` with today's date and drops a `tags:` value that is not a list. A
  post with `date: 2026` publishes with the wrong date and nothing complains.
  `tests/content-blog.test.ts` is the only thing that catches it.

- **The sitemap advertises URLs the site answers with a redirect.** `next.config.ts` sets
  `trailingSlash: true`, so `/blog` is served as `/blog/`, but `src/app/sitemap.ts` emits
  every URL without the trailing slash. Pinned by `tests/metadata-routes.test.ts`. Cosmetic
  — crawlers follow the redirect — but it is a redirect on every entry.

- **Two buttons on the home page go nowhere.** In `src/app/page.tsx`, the "Download CV"
  button and the location contact pill are both `href="#"`. There is no CV file anywhere in
  `public/`.

- **The gallery and the homelab rack photos are stock logos, not real images.**
  `src/app/gallery/page.tsx` lists `/next.svg` and `/vercel.svg` three times, and
  `src/app/homelab/page.tsx` lists the same two files as "rack photos". Both files carry a
  comment saying to drop real images into `public/gallery/` and `public/homelab/`; neither
  directory exists. The gallery page's own description text tells visitors this.

- **`src/app/gallery/page.tsx` still references the pre-`src/` path.** Its description
  tells the reader to edit `app/gallery/page.tsx`; the file has lived at
  `src/app/gallery/page.tsx` since the first commit.

- **Nothing tests the React components.** `src/components/track-list.tsx` holds real logic
  worth pinning — `pickImage` prefers `extralarge`/`large` and otherwise takes the last
  image, `artistName` falls back through `#text` → `name` → `"Unknown"`, and the
  `IntersectionObserver` paging stops when a page returns fewer than 50 tracks. None of it
  is exported, and testing it would need a DOM environment and a render library, neither of
  which is installed. Left untested deliberately rather than asserted against a mock.

- **The Last.fm network path is untested.** `fetchInitial()` in `src/app/music/page.tsx`
  and `fetchPage()` in `src/components/track-list.tsx` both call the real Last.fm API.
  Neither is exported and no HTTP boundary is injected, so testing them would mean stubbing
  `globalThis.fetch` around a module that reads its credentials at import time. Not done;
  the fallback behaviour it guards *is* covered, indirectly, by the build succeeding with
  no credentials in CI.

- **10 pnpm advisories are open** — `pnpm audit` reports 1 critical, 6 high and 3 moderate.
  Eight of them pre-date this work; the two remaining moderates arrived with the `vitest`
  dev-dependency tree (`vite`/`esbuild`) and affect the test runner only, not the exported
  site. None were touched: resolving them means moving dependency majors, which is a
  behaviour change and the owner's decision. Run `pnpm audit` for the current list.

<!-- autodoc:end -->
