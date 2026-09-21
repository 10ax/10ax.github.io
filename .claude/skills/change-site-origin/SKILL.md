---
name: change-site-origin
description: Use when moving the site to a custom domain, renaming the repository, or switching to a path-prefixed project site — the origin appears in metadata, sitemap.xml, robots.txt and OpenGraph, and a partial change breaks all of them at once.
---
<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->

# Change where the site is served from

The absolute origin is resolved in exactly one place — `resolveSiteUrl()` in
`src/lib/site-url.ts` — and read from `NEXT_PUBLIC_SITE_URL` at build time. It feeds
`metadataBase` in `src/app/layout.tsx`, every URL in `src/app/sitemap.ts`, and both the
`host` and `sitemap` fields of `src/app/robots.ts`.

It fails **silently**. An unset, empty or unparseable value falls back to
`https://10ax.github.io`, so a wrong origin produces a green build and a site full of links
to the old host. That is why each case below ends with a verification step.

## Before you start

Know which of the three you are doing — they are not interchangeable:

| | URL | Needs `basePath` |
|---|---|---|
| User site (today) | `https://10ax.github.io/` | no |
| Custom domain | `https://example.com/` | no |
| Project site | `https://10ax.github.io/repo/` | **yes** |

## Case A — a custom domain

1. Point DNS at GitHub Pages. `DEPLOY.md` → "Migrating to a custom domain" has the exact
   `ALIAS`/`CNAME` records and the four fallback `A` addresses.

2. Create `public/CNAME` containing the apex domain on a single line, nothing else. Files
   in `public/` are copied verbatim into `out/`, and Pages reads `out/CNAME`.

   ```bash
   echo "example.com" > public/CNAME
   ```

3. In **Settings → Pages → Custom domain**, enter the domain and save. Wait for the DNS
   check to go green, then tick **Enforce HTTPS**.

4. In **Settings → Secrets and variables → Actions → Variables**, set the repository
   variable `NEXT_PUBLIC_SITE_URL` to `https://example.com`. `deploy.yml` reads it as
   `vars.NEXT_PUBLIC_SITE_URL` and defaults to `https://10ax.github.io` when it is unset —
   which is the silent-failure path.

5. Re-run the deploy: push a commit, or dispatch **Deploy to GitHub Pages** manually.

## Case B — renaming the repository

Do not, unless you mean to move to a project site. Pages serves from the domain root only
while the repository is named `<username>.github.io`. Any other name makes it a project
site under `/<repo>/`, and since `next.config.ts` sets no `basePath`, every absolute path
Next.js emits — `/_next/...`, `/blog/...` — resolves one level too high and 404s. The site
will look completely broken while the build stays green.

If you rename it anyway, you must do Case C in the same change.

## Case C — a path-prefixed project site

Edit `next.config.ts` and add both keys — `basePath` alone is not enough:

```ts
const repo = "my-portfolio";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  // …images config stays as it is
};
```

Then set the `NEXT_PUBLIC_SITE_URL` variable to `https://10ax.github.io/my-portfolio`.
`resolveSiteUrl()` keeps a path prefix and strips only a trailing slash, so both
`.../my-portfolio` and `.../my-portfolio/` resolve to the same value.

## Verify — in every case

Locally, with the new value, before pushing:

```bash
NEXT_PUBLIC_SITE_URL=https://example.com pnpm exec vitest run tests/metadata-routes.test.ts
NEXT_PUBLIC_SITE_URL=https://example.com pnpm run build

grep -o 'https://[^"<]*' out/sitemap.xml | sort -u | head
cat out/robots.txt
grep -o '<meta property="og:image" content="[^"]*"' out/index.html
```

(`og:image` is the tag that carries the origin — the layout sets no `openGraph.url`, so
there is no `og:url` to grep for.)

Every URL in `out/sitemap.xml` and `out/robots.txt` must carry the new origin. If any still
say `10ax.github.io`, the variable did not reach the build — that is the fallback firing,
not a caching artefact.

Preview the export the way Pages will serve it:

```bash
pnpm exec serve out       # http://localhost:3000
```

After the deploy, check the live `https://<new-origin>/robots.txt` and `/sitemap.xml`
directly. They are the fastest proof that the runner saw the variable, because they are
generated entirely from it.

## What not to change

- Do not hard-code the origin anywhere. `FALLBACK_SITE_URL` in `src/lib/site-url.ts` is the
  single literal, and it is a fallback, not configuration.
- Do not remove `trailingSlash: true` from `next.config.ts`. Pages serves files as-is, and
  the export relies on `<route>/index.html` directories.
- Do not add a redirect for the old origin. This is a static export; there is no server to
  redirect with, and Next.js `redirects()` is ignored under `output: "export"`.

<!-- autodoc:end -->
