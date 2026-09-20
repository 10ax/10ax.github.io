---
name: diagnose-failed-deploy
description: Use when the Deploy to GitHub Pages workflow is red, the published site is stale or broken, or a build that passes locally fails on the runner.
---
<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->

# Diagnose a failed deploy

`.github/workflows/deploy.yml` runs on every push to `master`, on manual dispatch, and
**hourly on a cron** to refresh `/music`. A red run therefore has three common shapes:
a genuine build break, a runner/environment difference, and a Pages concurrency problem.
Work through them in that order.

## 0. Reproduce the runner locally

Everything else is guesswork until this matches what the runner does:

```bash
node --version      # must be 20 — the workflow pins node-version: 20
pnpm install --frozen-lockfile --ignore-scripts
pnpm run build
```

If your machine is on 22 or newer, switch (`nvm use 20`) before concluding anything. A
green build on a different Node major does not prove the deploy will be green.

## 1. Is it the content?

The most frequent break is a blog post, because `src/lib/posts.ts` parses every file in
`content/blog/` at build time and one bad file fails everything:

```bash
pnpm exec vitest run tests/content-blog.test.ts
```

This names the offending slug. A `YAMLException` in the deploy log is the same failure seen
from the other end. `docs/TROUBLESHOOTING.md` has the valid frontmatter shape.

## 2. Is it the code?

Run the same four checks CI runs, in order, and stop at the first red one:

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm exec vitest run
pnpm run build
```

`ci.yml` runs exactly these on push and pull request, so a break here should have been
caught before the deploy. If CI was green and deploy was red, the difference is the
environment — go back to step 0, then read step 4.

## 3. Is it a concurrency or duplication problem?

```bash
ls .github/workflows/
grep -n -A 3 'concurrency' .github/workflows/*.yml
```

There must be exactly **one** workflow that deploys. `deploy.yml` holds
`concurrency: group: pages` with `cancel-in-progress: false` on purpose, so an hourly cron
run is allowed to finish instead of being cancelled by the next push — which also means a
long run can leave later ones queued. `ci.yml` must never join that group and must never
use `actions/deploy-pages`. Commit `c251501` removed a leftover `jekyll-gh-pages.yml` that
was deploying in parallel; if a second deploying workflow has reappeared, that is the bug.

Check the workflows still parse before pushing a fix:

```bash
actionlint .github/workflows/*.yml
```

## 4. The build succeeded but the site is wrong

**Every asset 404s, or links point at the wrong host.** The repository has been renamed away
from `10ax.github.io`. Pages now serves a path-prefixed project site while
`next.config.ts` sets no `basePath`/`assetPrefix`. Rename it back, or follow
`DEPLOY.md` → "Migrating to a project site" and set the `NEXT_PUBLIC_SITE_URL` repository
variable in the same change.

**`_next/` assets 404 but pages load.** `public/.nojekyll` is missing, so Pages ran Jekyll
over the export and dropped directories beginning with an underscore.

**`/music` shows four fallback artists.** Working as designed when
`NEXT_PUBLIC_LASTFM_API_KEY` or `NEXT_PUBLIC_LASTFM_USER` is absent — and also when Last.fm
answers with an error, since `fetchInitial()` swallows both cases. Confirm the names:

```bash
grep -n 'NEXT_PUBLIC_LASTFM' .github/workflows/deploy.yml
```

The workflow reads both as repository **secrets**, both `NEXT_PUBLIC_`-prefixed. The table
in `DEPLOY.md` is stale and asks for a *variable* `LASTFM_USER` and a *secret*
`LASTFM_API_KEY`; following it yields a working build with no scrobbles and no error.

**Metadata points at the wrong origin.** `NEXT_PUBLIC_SITE_URL` is unset or malformed, so
`src/lib/site-url.ts` fell back to `https://10ax.github.io`. It falls back silently for any
value the URL parser rejects.

```bash
pnpm exec vitest run tests/site-url.test.ts tests/metadata-routes.test.ts
```

**The site is simply old.** Check the Actions tab for a skipped or queued cron run. A
manual `workflow_dispatch` of **Deploy to GitHub Pages** is the quickest way to force a
refresh without an empty commit.

## 5. Still stuck

`docs/TROUBLESHOOTING.md` covers the rest symptom-first — font downloads at build time,
OpenGraph `Content-Type`, the `force-static` requirement on metadata routes, the historical npm
arborist crash — and its final section lists what is already known to be broken, so you do
not spend an evening rediscovering it.

<!-- autodoc:end -->
