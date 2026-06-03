# Repository instructions

## What this repo is

- Personal portfolio/blog built with Next.js App Router.
- Fully static export (`output: "export"`) and deployed to GitHub Pages.
- Content-driven blog posts live in `content/blog/*.mdx` and are rendered from `src/lib/posts.ts`.

## Technology stack & versions

- Next.js: `16.2.6`
- React: `19.2.4`
- TypeScript: `^5`
- ESLint: `^9` with `eslint-config-next`
- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`)
- Markdown parsing: `gray-matter`, `next-mdx-remote`
- Syntax highlighting: `rehype-pretty-code`, `shiki`

## Commands

- Install dependencies: `npm ci`
- Development server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`

## Deployment workflow

- Workflow: `.github/workflows/deploy.yml`
- Triggers:
	- Push to `master` or `main`
	- Hourly cron (`0 * * * *`)
	- Manual dispatch
- Build output uploaded from `./out` and deployed with `actions/deploy-pages`.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical site URL used by metadata, robots, and sitemap.
- `NEXT_PUBLIC_LASTFM_API_KEY`: Last.fm API key for the music page.
- `NEXT_PUBLIC_LASTFM_USER`: Last.fm username.

Notes:

- GitHub Actions `vars.*` may resolve to an empty string if unset.
- URL parsing must treat empty and invalid values as fallback defaults.

## Code layout

- App routes: `src/app/**`
- Shared UI components: `src/components/**`
- Data helpers/utilities: `src/lib/**`
- Blog source files: `content/blog/**`
- Public static assets: `public/**`

## Static export constraints

- Keep pages compatible with static export (`next build` + `output: "export"`).
- Metadata routes like `robots.ts`, `sitemap.ts`, and OG image generators should stay static-safe.
- When needed, use `export const dynamic = "force-static"` for metadata/file routes.
- Avoid adding runtime-only features that require a Node.js server in production.

## Quality and safety priorities

- Prefer small, focused changes over broad refactors.
- Do not commit secrets or sensitive values.
- Keep TypeScript strictness and Next.js lint/build compatibility.
- Preserve accessibility and semantic HTML in UI changes.

## Default response style

- Code only, no explanation, unless explicitly requested by the user.
- Bullets over paragraphs by default.
- No explanations unless asked.

## Next.js docs source of truth

- This repo includes Next.js docs under `node_modules/next/dist/docs/`.
- For version-sensitive App Router behavior, consult local docs before implementing.
