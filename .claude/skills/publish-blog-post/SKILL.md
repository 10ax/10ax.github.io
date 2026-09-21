---
name: publish-blog-post
description: Use when adding, editing or removing a post in content/blog — the frontmatter is parsed at build time, so a mistake here fails the deploy rather than showing up as a broken page.
---
<!-- autodoc:begin -->
<!-- autodoc: cd2f189 2026-09-16 -->

# Publish a blog post

A post is one `.mdx` file in `content/blog/`. Nothing registers it: `src/lib/posts.ts`
reads the whole directory at build time, and the filename becomes the URL. Adding a file is
the entire publishing step — and the frontmatter in it is the only thing that can break the
deploy.

## 1. Create the file

The filename minus its extension is the slug, and the slug is the URL. Use lowercase words
joined by hyphens — `tests/content-blog.test.ts` enforces that shape.

```bash
$EDITOR content/blog/my-new-post.mdx     # → https://10ax.github.io/blog/my-new-post/
```

Start it with exactly this frontmatter block:

```mdx
---
title: The title that appears on the page and in <title>
date: 2026-09-16
description: One sentence. Used for the blog index and the OpenGraph description.
tags: [linux, audio]
---

The body starts here. Markdown plus JSX.
```

Rules that are easy to get wrong, all of them enforced or pinned by the test suite:

- `date` must be a bare `YYYY-MM-DD` with **no time and no zone offset**. A value like
  `2026-05-31 23:00:00 -05:00` is converted to UTC and can land on the wrong day.
- `date` must not be a bare number. `date: 2026` is a YAML integer, which is silently
  replaced with today's date and never warns.
- `tags` must be a YAML **list**. `tags: meta` is silently dropped; write `tags: [meta]`.
- `title` must be present. Without it the slug is used as the title, which looks like a
  title until you read it.
- `description` is optional. An empty string counts as absent.

Both `.md` and `.mdx` are read; everything else in the directory is ignored.

## 2. Code fences

Highlighting is `rehype-pretty-code` + Shiki, configured in `src/app/blog/[slug]/page.tsx`.

````mdx
```bash showLineNumbers
echo "line numbers on"
```

```ts {2,4-6}
// whole-line highlight
```

```ts /needle/
// inline word highlight
```
````

If line numbers render wrong, do not adjust the fence — the cause is in the `pre` entry of
`mdxComponents` in `src/app/blog/[slug]/page.tsx`, and the comments there explain it.

## 3. Verify before you push

```bash
pnpm exec vitest run tests/content-blog.test.ts   # fails naming the bad slug
pnpm run build                                # the real thing
```

Run the content test first: it reads the committed posts and reports the offending slug,
whereas a build failure gives you a YAMLException and a stack.

Then the full gate:

```bash
pnpm run lint && pnpm exec tsc --noEmit && pnpm test && pnpm run build
```

## 4. Check it locally

```bash
pnpm run dev     # http://localhost:3000/blog
```

Confirm the post appears on `/blog` with the right date and tags, and that
`/blog/<slug>` renders. Posts are ordered newest first by the `date` string.

## 5. Ship it

Commit the `.mdx` file and push to `master`. `.github/workflows/deploy.yml` builds and
publishes; nothing else is needed. The post's OpenGraph image is generated automatically by
`src/app/blog/[slug]/opengraph-image.tsx`, and `sitemap.xml` picks it up on the same build.

## Removing a post

Delete the file. The route, its sitemap entry and its OpenGraph image all disappear on the
next build — but the URL will 404 for anyone holding a link, and this site has no redirect
mechanism (it is a static export). Prefer editing over deleting.

<!-- autodoc:end -->
