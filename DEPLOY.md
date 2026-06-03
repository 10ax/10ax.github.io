# Deployment

This site is statically exported (`output: 'export'`) and hosted on **GitHub Pages**.

## Current setup: user/org site

Deploys go to `https://<username>.github.io/`.

### One-time GitHub setup

1. **Repository name** — the repo must be named exactly `<username>.github.io` for
   user/org sites with no path prefix. If your repo is currently `my-portfolio`,
   rename it (Settings → General → Repository name).

2. **Enable Pages from GitHub Actions** — Settings → Pages → *Source*: select
   **GitHub Actions** (not "Deploy from a branch").

3. **Add repository variables and secrets** (Settings → Secrets and variables → Actions):

   | Type     | Name                          | Example value                       |
   | -------- | ----------------------------- | ----------------------------------- |
   | Variable | `NEXT_PUBLIC_SITE_URL`        | `https://<username>.github.io`      |
   | Variable | `LASTFM_USER`                 | `your-lastfm-username`              |
   | Secret   | `LASTFM_API_KEY`              | (Last.fm API key — not the secret)  |

   > The Last.fm vars are mapped to `NEXT_PUBLIC_LASTFM_*` at build time
   > (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)) so the
   > client-side infinite-scroll on `/music` can call the Last.fm API directly
   > from the browser. Last.fm read-only API keys are designed for public
   > client-side use; the actual sensitive value is the Shared Secret, which we
   > never use. Storing the key as a GitHub *Secret* keeps it out of repo
   > history while still allowing it to be embedded in the static bundle.

4. **Push to `master` or `main`** — the [`deploy.yml`](.github/workflows/deploy.yml) workflow runs
   `npm run build`, uploads `./out/` and publishes via `actions/deploy-pages`.

5. **Hourly refresh** — the workflow also runs on an hourly cron so the
   `/music` page picks up new Last.fm scrobbles without a manual push.

## Migrating to a custom domain (e.g. Porkbun)

When you buy `example.com` from Porkbun:

### 1. DNS records on Porkbun

In the Porkbun dashboard → DNS for your domain, add:

| Type      | Host                 | Answer                    | TTL |
| --------- | -------------------- | ------------------------- | --- |
| `ALIAS`   | *root*               | `<username>.github.io.`   | 600 |
| `CNAME`   | `www`                | `<username>.github.io.`   | 600 |

In Porkbun, *root* means `@` or a blank host value.

> Porkbun supports `ALIAS`/`ANAME` records at the apex; if for some reason you can't
> use ALIAS, fall back to the four GitHub Pages `A` records:
> `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.

### 2. Add a `CNAME` file

Create `public/CNAME` containing exactly your apex domain on a single line:

```txt
example.com
```

(It will be copied verbatim into `./out/CNAME` on build, which GitHub Pages reads to
bind the custom domain.)

### 3. Update GitHub repo settings

- Settings → Pages → **Custom domain**: enter `example.com` and save.
- Wait for the DNS check to go green, then tick **Enforce HTTPS**.

### 4. Update env variables

- Repository variable `NEXT_PUBLIC_SITE_URL` → `https://example.com`
  (this propagates to `metadataBase`, OpenGraph URLs, `sitemap.xml`, `robots.txt`,
  and JSON-LD).

### 5. Trigger a rebuild

Push any commit, or run the **Deploy to GitHub Pages** workflow manually from the
Actions tab. The next deploy will publish under the custom domain.

## Migrating to a project site (`<username>.github.io/<repo>/`)

If you ever decide to host this as a project site (path-prefixed) instead of the
user/org site, you need to set `basePath` and `assetPrefix` in
[`next.config.ts`](next.config.ts):

```ts
const repo = "my-portfolio";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  // …rest stays the same
};
```

Also update `NEXT_PUBLIC_SITE_URL` to `https://<username>.github.io/<repo>`.

## Local sanity check

```bash
npm run build      # writes ./out/
npx serve out      # preview the exported site at http://localhost:3000
```

## Known quirk: OG image Content-Type

The dynamic OpenGraph images are emitted as `out/opengraph-image` and
`out/blog/<slug>/opengraph-image` — valid PNGs but without a `.png` extension.
GitHub Pages will serve them as `application/octet-stream`. In practice all major
social crawlers (Facebook, X/Twitter, LinkedIn, Discord, Slack) sniff the image
bytes and render them correctly, and the `og:image:type` meta tag advertises
`image/png`, so this is cosmetic. If you ever need a strict Content-Type, switch
the OG generation to literal `opengraph-image.png` files committed to
`src/app/` instead of the `.tsx` route handlers.
