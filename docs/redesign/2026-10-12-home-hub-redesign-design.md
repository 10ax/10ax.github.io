# Home hub redesign: design spec

Date: 2026-10-12
Status: awaiting owner review
Scope: visual system overhaul plus one information-architecture change (a new `/cv` route)

## 1. Design read

> A personal home page for Francesco Tenace, for recruiters and engineer peers, with a
> cinematic dark "engineering" language carrying 8-bit and space motifs, leaning toward
> Tailwind v4 utilities, Geist and Archivo, Motion for springs, and a code-authored pixel
> sprite.

This is **not** a CV page any more. The owner asked for the home page to stop being a CV
and instead express four interests: progressive rock, GBA-era nostalgia (a Pokémon
Emerald-style sprite), space, and Linux/IT. The CV moves to its own route.

Redesign mode per the design skill: **overhaul**. New visual language on top of preserved
content and preserved information architecture, except for the one deliberate addition in
section 3.

Dials, from the "Portfolio (Developer)" baseline `6/5/4` with the overhaul adjustment
`+2/+2`, then hand-tuned:

| Dial | Value | Reason |
|---|---|---|
| `DESIGN_VARIANCE` | 8 | scene hero, bento stack section, asymmetric lists. No equal three-card rows anywhere |
| `MOTION_INTENSITY` | 7 | scroll reveals, springs, parallax starfield, magnetic primary CTA. Every item reduced-motion gated |
| `VISUAL_DENSITY` | 5 | the CV route is data-dense, so mono metadata with `tabular-nums`; the hub is deliberately airy |

## 2. Hard constraints that survive untouched

From `CLAUDE.md` and the repo's documented invariants:

- `output: "export"` stays. No route handlers, no server actions, no middleware, no
  `next/image` optimiser, no ISR. Every metadata route keeps `export const dynamic = "force-static"`.
- The build must succeed with **no environment variables set**.
- Only read-only public values carry the `NEXT_PUBLIC_` prefix. The Last.fm shared secret
  never appears anywhere.
- `deploy.yml` is not touched. `AGENTS.md`, `DEPLOY.md` and the first line of `CLAUDE.md`
  are not touched.
- Generated prose in `README.md` and `CLAUDE.md` stays strictly between the
  `autodoc:begin` / `autodoc:end` markers.
- `public/.nojekyll` is not touched.
- The repository name stays `10ax.github.io`, so no `basePath` is introduced.
- Existing page slugs are unchanged, and the five existing nav labels stay byte-identical:
  `Home`, `Blog`, `Gallery`, `Music`, `Homelab`. Exactly one label is added, `CV`, per
  section 3.
- `lint`, `tsc --noEmit`, `test` and `build` all pass before anything is committed.

## 3. Information architecture

One change, explicitly approved by the owner:

| Route | Status | Job |
|---|---|---|
| `/` | recomposed | Personal hub: scene hero, interests, destinations. No CV sections |
| `/cv` | **new** | The CV: profile, experience, skills, languages, education. Carries the Person JSON-LD |
| `/blog`, `/blog/[slug]` | restyled | unchanged slugs and URLs |
| `/gallery` | restyled | unchanged, no new route, no per-photo URL |
| `/music` | restyled | unchanged |
| `/homelab` | restyled | unchanged |
| `/not-found` | **new** | branded 404 |

Nav order becomes `Home / CV / Blog / Gallery / Music / Homelab` (six items, one line at
1024px; the header is 64px tall and the labels are short).

SEO plan for the move:

- The `Person` JSON-LD stays on `/` because it describes identity, not a CV. An
  `EmployeeRole`-style `hasOccupation` block moves with the CV content onto `/cv`,
  so the two pages do not both claim to be a CV.
- `/cv` is added to `sitemap.ts` with `changeFrequency: "monthly"`, `priority: 0.9`,
  placed directly after the home entry.
- The home hero links to `/cv` with one primary CTA, so the recruiter path is one click
  and one crawler hop.
- Page titles change separator from `—` to `|` (see section 9).

### Test impact of the IA change

`tests/metadata-routes.test.ts` pins "the five static routes" in three places
(lines 56-66, 91-102) and `entries` length as `5 + posts.length`. Adding `/cv` therefore
breaks three assertions. This is an intentional, owner-approved change, not a bug, so the
pinned expectations are updated in the same commit as `sitemap.ts`, and the change is
recorded in `docs/TROUBLESHOOTING.md` under Known issues as a schema change rather than
being silently rewritten.

## 4. Foundations

### 4.1 Colour tokens

CSS variables on `:root`, overridden under `[data-theme="dark"]` and
`[data-theme="light"]`, consumed through `@theme inline` so Tailwind utilities read them.
One strategy, one accent, locked page-wide.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--surface` | `#08090b` | `#f7f7f5` | page base. Cool off-black, warm off-white. Never `#000` or `#fff` |
| `--surface-raised` (`--panel`) | `#0f1116` | `#fdfcfa` | panels, cards, bento cells. The light value is deliberately not `#ffffff` |
| `--surface-sunken` (`--sunken`) | `#050608` | `#eaeae4` | wells, code blocks |
| `--line` | `rgb(255 255 255 / .08)` | `rgb(8 9 11 / .10)` | hairlines and borders |
| `--line-strong` | `rgb(255 255 255 / .16)` | `rgb(8 9 11 / .18)` | pixel-panel borders |
| `--ink` | `#e8eaed` | `#14161a` | body and headings |
| `--ink-muted` | `#8b929c` | `#5b626b` | metadata, captions |
| `--accent` | `#3fbf94` | `#106b50` | the single accent, emerald family, desaturated |
| `--accent-ink` | `#04231a` | `#fdfcfa` | text on an accent fill |
| `--star` | `rgb(255 255 255 / .85)` | `rgb(8 9 11 / .55)` | starfield particles |

Rules: no purple, no gradient text, no neon outer glow, no pure black, no pure white, no
second accent, tinted shadows only (`box-shadow` carries the surface hue, never flat
black). Both themes must hold WCAG AA for body text and AAA for hero copy; the final
values are contrast-checked during slice 1 against the real rendered output.

Precedence is part of the contract: a visitor's explicit choice, stored by the toggle and
written to `data-theme`, always beats the system preference. The system-preference block is
only the fallback for a visitor who has not chosen, so `:root` and `[data-theme="..."]`
have equal specificity and the fallback must appear first in source order. A toggle that
cannot override a dark OS preference is a broken toggle, and no test in this suite would
catch it.

The existing `themeColor` in `layout.tsx` (`#020617`) is replaced with the new
`--surface` per theme, emitted through `viewport`.

### 4.2 Typography

| Role | Face | Notes |
|---|---|---|
| Display / headlines | `Archivo` variable, axes `wght` + `wdth` | `next/font/google`, self-hosted by the build, `display: swap` |
| Brand / UI / body | `Geist` | already present |
| Data / metadata / code | `Geist Mono` | already present |
| Micro-labels, 8-bit read-outs | `Silkscreen` | tiny labels only, never body copy |

Scale: display `text-4xl md:text-5xl lg:text-6xl`, `tracking-tight`, `leading-[1.05]`,
`text-wrap: balance` on headlines and `text-wrap: pretty` on paragraphs. Body capped at
`65ch`. All years, periods and counts use `tabular-nums`. No serif anywhere: the design
skill discourages serif as a default and bans the two the model reaches for first.

Italic is used at most once, in the hero, and any italic word with a descender gets
`leading-[1.1]` plus bottom padding so nothing clips.

### 4.3 Shape, space, layers

- **Shape lock:** interactive elements are full-pill; panels are `16px`; pixel panels use
  a stepped 2px border with notched corners via `clip-path`; inner chips and inputs are
  `8px`. Documented here so the whole site follows one rule instead of improvising per
  page.
- **Container:** `max-w-[1400px]` with auto margins, `px-5 md:px-8`. Section rhythm
  `py-20 md:py-28`, deliberately uneven at the top and bottom of a section.
- **Viewport:** `min-h-[100dvh]` everywhere, never `h-screen`.
- **Z-index scale:** `starfield 0 / content 10 / sticky header 40 / drawer 50 / grain 60 /
  lightbox 70`. No ad-hoc values.
- **Grain:** one fixed `pointer-events-none` noise layer at under 4 percent opacity.
  Never on a scrolling container, so mobile repaints stay cheap.
- **Ambient glow:** one soft radial gradient behind the hero, low alpha, tinted to the
  accent. Not a mesh, not animated.

### 4.4 Motion

Everything lives in isolated `"use client"` leaves. No `window.addEventListener("scroll")`
anywhere: the design skill bans it outright. Only `transform` and `opacity` animate.

| Moment | Communicates | Mechanism |
|---|---|---|
| Hero sprite idle bob | presence, character | 2-frame CSS `steps()` loop, 1.2s, or the 2-frame sheet if supplied |
| Hero menu items | hierarchy on arrival | staggered `y: 24 → 0`, 60ms cascade, spring |
| Starfield | depth, space motif | 3 parallax layers via `useScroll` + `useTransform`, translate only |
| Section blocks | content arriving in order | `whileInView`, `once: true`, `amount: 0.3` |
| Stack bento cells | feedback | spotlight border tracking the cursor, spring |
| Primary CTA | feedback | magnetic pull via `useMotionValue`, no React state |
| Music "now playing" | live state | one slow pulse, only when a scrobble is genuinely now playing |
| Gallery open | continuity | same-route `<ViewTransition>` crossfade, morph if it holds up |
| Route change | continuity | `<ViewTransition>` on the header and main, wrapped in try-and-verify |

Under `prefers-reduced-motion: reduce` every row above degrades to a static frame, and the
starfield stops moving. Under `prefers-reduced-transparency` the blur-based surfaces fall
back to solid fills.

## 5. The sprite

Deliverable of a separate task; the site never blocks on it.

### 5.1 Contract

- Authoring format: a committed text pixel grid (one character per pixel) plus a palette
  of six to eight GBA-plausible colours, held in `src/sprites/*.ts`.
- Build step: `scripts/build-sprite.ts` compiles each grid to one horizontal strip PNG per
  state at 1x and 4x, under `public/sprites/`, at integer scales only. A strip is what CSS
  `steps()` animates directly, so the component contains no slicing logic.
- Cell size fixed at 16x24. Rendered at 4x that is 64x96, which is the hero size. Rows are,
  in order: `idle` (2 frames), `walk` (4 frames), `interact` (2 frames), eight cells in
  total. Two frames are authored by hand; `walk` and `interact` derive their extra cells
  from those two plus small `dx`/`dy` offsets, which is how sprites this size animate and
  keeps the art reviewable at two grids instead of eight.
- Rendering: `image-rendering: pixelated`, no smoothing, no filters, no fractional
  scaling, `width`/`height` reserved in CSS so there is no layout shift.
- Both themes serve the same art. The palette carries its own dark outline, so it reads on
  the light surface as well; a separate mono or duotone pass is a later lever, not part of
  this change.
- `prefers-reduced-motion` freezes the sprite on `idle` frame 0.
- Accessibility: the sprite is decorative, so it is `aria-hidden` with an empty `alt` on
  any `img`, and the meaning it carries in the hero is also present as text.

### 5.2 Upgrade path

Because the pipeline accepts any 1x PNG grid cell, externally generated or commissioned
art drops in by replacing the PNG and nothing else. The code-authored sprite is the
default, an artist's sprite is a later swap.

## 6. Page composition

### 6.1 `/` home hub

One eyebrow is permitted in the hero and nowhere else on the page, which satisfies the
design skill's one-eyebrow-per-three-sections budget mechanically.

1. **Scene hero** (top padding capped at `pt-24`, and it fits the initial viewport at desktop:
   measured 607px at 1280x800, with the headline, subtext and primary CTA all above the fold) -
   starfield layers, the sprite standing on a ground line, the name in Archivo, and the
   destination menu anchored to the scene. Menu items are real `<a>` links with real labels and
   are keyboard reachable, so the hero is crawlable and screen-reader legible. No gate, no
   "press start" wall. One primary CTA (`View CV`) plus one secondary (`GitHub`).

   On a 390x844 phone the hero measures 863px: headline, subtext and the primary CTA are above
   the fold (CTA bottom at 376px) and nothing overflows horizontally, but the six-destination
   menu completes just below the first screen. That is accepted rather than chased: a scene, a
   mascot and a six-item menu will not always fit one phone screen, real mobile viewports are
   shorter than 844px once browser chrome is subtracted, and the properties that matter (the
   offer above the fold, no gate, no horizontal overflow) hold. The menu was widened to two
   columns at all widths to keep the overshoot to 19px.
2. **Now** (asymmetric two-column) - a short "what I am doing right now" paragraph plus
   three real facts: current role and stack, what the homelab runs, what is playing. Mono
   metadata, `tabular-nums`.
3. **Interests** (bento, asymmetric 2+3) - exactly five cells for the five interests the
   owner named plus the two the site already expresses: music (progressive rock), space,
   retro gaming, Linux and the homelab, and writing. Two or three cells carry real visual
   variation: an album-art crop from the last scrobble, a starfield tile, the sprite. No
   cell is an empty filler, no cell is a white-on-white text box, and every cell is
   grounded in content the site actually has.
4. **Linux / homelab band** (full-bleed photo band) - one real rack photo, three facts,
   link to `/homelab`. Breaks the type rhythm and gives the page a second image moment.
5. **Latest writing** (asymmetric list with hairline dividers) - the newest post set
   larger, the next two as rows. Not three equal cards.
6. **Listening** (compact mono strip) - two recent scrobbles with real album art, link to
   `/music`.
7. **Contact** (CTA band) - one label, reused verbatim in the footer. No duplicate-intent
   second CTA.

Mobile: every multi-column block above declares its `< 768px` collapse; the bento becomes
one column, the asymmetric pairs stack, the scene hero reduces to sprite plus headline
plus menu.

### 6.2 `/cv`

The current home page's content, recomposed rather than copied: profile header, experience
as a sticky-stack (each role pins, the previous scales to 0.92 and dims), skills as a
5-cell bento by category, languages, education, and a download link. `CV_DATA` moves into
`src/lib/cv-data.ts` so it is imported rather than re-declared, which keeps the CV facts in
one place. All CV facts stay byte-identical: job titles, employers, dates, tech lists,
contact details. Structured data: `Person` stays on `/`, the `hasOccupation` array moves
to `/cv`.

### 6.3 `/blog`

Featured latest post as a wide asymmetric block, remaining posts as a hairline-divided
list. No tag filter, because filtering would be new IA.

### 6.4 `/blog/[slug]`

Measure moves to `65ch`. The MDX component map stops hardcoding slate and white and reads
tokens instead, so posts are correct in both themes. Headings render in Archivo. A thin
accent reading-progress bar (client island) sits at the top. Prev/next links close the
current dead end. No table of contents: the posts are short. Shiki already declares a
light and a dark theme, which now matches the token layer instead of fighting it; the code
block chrome is retuned to tokens and the existing line-number utilities keep working
exactly as they do today, including the `content-[counter(line)]` rule paid for in
`951770d`.

### 6.5 `/gallery`

Masonry with deliberately mixed aspect ratios. Clicking a photo opens an in-page lightbox:
keyboard navigation with Escape and the arrow keys, a focus trap, focus returned to the
trigger on close, and a same-route `<ViewTransition>` crossfade. No new route and no new
indexable URL, so the IA is unchanged. Until real photos exist, slots are labelled
placeholders that render as photographs, not as stock logos.

### 6.6 `/music`

A now-playing card, an album-art mosaic, then a dense mono list, replacing today's equal
three-column card grid. The existing client `IntersectionObserver` infinite scroll and the
Last.fm fallback list both stay. The spinner is replaced by a skeleton that matches the row
shape, so loading looks like the content rather than a generic cycle.

### 6.7 `/homelab`

Stack strip, services as a six-cell asymmetric bento with spotlight borders (six services,
six cells, no blanks), rack photos in masonry. The stock `next.svg` and `vercel.svg`
placeholders are deleted from both this page and `/gallery`.

### 6.8 `not-found`

Branded 404 in the same scene language, with links to `/` and `/blog`. Closes the current
gap where an unknown URL falls to Next's default.

## 7. Component inventory

New:

- `src/lib/theme.ts` - the pre-paint theme script as a string, plus the storage key
- `src/lib/nav.ts` - the six nav links, single source of truth for header, footer, drawer
- `src/lib/cv-data.ts` - moved CV data, typed, one consumer per page
- `src/components/theme-toggle.tsx`, `skip-link.tsx`
- `src/components/scene/starfield.tsx`, `scene/sprite.tsx`, `scene/hub-menu.tsx`
- `src/components/reveal.tsx`, `spotlight-card.tsx`, `magnetic-cta.tsx`, `pixel-label.tsx`
- `src/components/reading-progress.tsx`, `lightbox.tsx`
- `src/sprites/*.ts` and `scripts/build-sprite.ts`
- `src/app/cv/page.tsx`, `src/app/not-found.tsx`

Changed: `layout.tsx` (tokens, fonts, theme script, skip link), `globals.css` (token layer,
grain, pixel utilities), `site-header.tsx` (active state, toggle, drawer),
`site-footer.tsx` (one contact label, real links), `page-header.tsx` (token-driven, no
mandatory mono eyebrow), `page.tsx` (becomes the hub), the four sub-page routes,
`track-list.tsx` (skeleton), both `opengraph-image.tsx` files and the two blog ones (new
palette, `|` separator).

Removed: `lucide-react`, once every call site has moved to `@phosphor-icons/react`.

`src/lib/site-url.ts` and `src/lib/posts.ts` are not changed.

## 8. Dependencies

| Change | Package | Why |
|---|---|---|
| add | `motion` | springs, scroll reveals, `useReducedMotion`. Import from `motion/react` |
| add | `@phosphor-icons/react` | replaces Lucide, one family, `regular` weight with `fill` for active state |
| add | `next/font/google` faces | `Archivo` (variable, `wght` + `wdth`) and `Silkscreen`. No `<link>` to Google Fonts in production |
| remove | `lucide-react` | after migration, so the repo does not carry two icon families |

No other dependency is introduced. `next.config.ts` gains only
`experimental: { viewTransition: true }`, and only if the verification in section 10
passes.

## 9. Content rules

- **Em-dash:** zero `—` and zero `–` in any user-visible string: titles, headings, body
  copy, buttons, pills, captions, alt text, footer. Page titles move from
  `Blog — Francesco Tenace` to `Blog | Francesco Tenace`. The prose of the three
  **published** MDX posts is left untouched, because rewriting published writing is a
  content change and not a redesign; that deviation is recorded in section 12. Em-dashes in
  code comments and JSDoc are not user-visible and are not churned.
- **Copy freedom:** headlines, section intros, labels and microcopy are rewritten. Every CV
  fact stays byte-identical.
- **CTA labels:** one label per intent, no repeated intent. The hero carries `View CV`
  (CV intent) and `GitHub` (outbound profile intent). The contact intent appears exactly
  twice, in the contact band and in the footer, with the same label both times.
- **Banned by the design skill and not shipped:** decorative status dots, scroll cues,
  version labels in the hero, locale or weather strips, section-number eyebrows, pills
  overlaid on images, photo-credit captions as decoration, "Scroll to explore", fake
  product UI, progress bars with filled tracks, `border-t` plus `border-b` on every row of
  a long list.
- **Images:** no hand-rolled decorative SVG, no fake screenshots. The sprite is pixel art
  with a real pipeline; everything else is a real photograph.

## 10. Verification

Every slice must pass, in this order:

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```

Plus these checks, each of which is a gate rather than a nicety:

1. **View transitions with the static export.** Before the feature is relied on, enable
   the flag and confirm `out/` still builds and navigation still works with JavaScript
   disabled. If it does not, the flag is removed and the fallback is a plain swap. This is
   an experimental Next flag on a repo whose only invariant is a predictable export, so the
   check comes before the feature, not after.
2. **No-env build.** `pnpm run build` with no variables set, exactly as CI does it.
3. **Export contents.** `out/cv/index.html`, `out/gallery/index.html` and the sprite PNGs
   all exist; `/cv` is present in `out/sitemap.xml`.
4. **Both themes.** Every route opened in light and dark, contrast measured on real
   rendered output, not on the token values.
5. **Reduced motion.** With `prefers-reduced-motion: reduce`, the starfield is static and
   no reveal animates.
6. **Keyboard pass.** Tab through the header, the hub menu, the lightbox and the CV route.
   Focus is always visible, the skip link works, the lightbox traps and restores focus.
7. **Pre-flight checklist** from the design skill, run mechanically at the end: eyebrow
   count per page, no three-equal-card row, layout family varied per section, nav on one
   line under 80px, no CTA wrapping at desktop, contrast on every button and form, sprite
   contract honoured.

New tests:

- `tests/sprite-sheet.test.ts` - every row of every grid is the same length, every palette
  index is in range, frame counts match the contract. A broken sprite fails a test rather
  than shipping.
- `tests/nav.test.ts` - the six links, their labels and their order, and that every href is
  a real route.
- `tests/theme.test.ts` - the pre-paint script is a fixed string with no interpolation, and
  the storage key is what the toggle reads.
- `tests/metadata-routes.test.ts` - updated expectations for the new sixth static route.

## 11. Delivery slices

Each slice ends green on all four commands and is reviewable on its own.

1. **Foundations** - tokens, fonts, Phosphor migration, theme toggle with the pre-paint
   script, skip link, header, footer, `not-found`, grain. Nothing is recomposed yet.
2. **Sprite** - grids, palette, `scripts/build-sprite.ts`, generated PNGs, the sprite test.
3. **Home hub** - scene hero, menu, starfield, then sections 2 to 7.
4. **`/cv`** - data moves to `src/lib/cv-data.ts`, the route, the JSON-LD split, sitemap and
   its test.
5. **Blog** - index and post, MDX token map, reading progress, prev/next.
6. **Gallery** - masonry and lightbox.
7. **Music** - now-playing, mosaic, list, skeleton.
8. **Homelab** - stack strip, services bento, photo masonry.
9. **Pre-flight and polish** - the checklist in section 10, plus the docs update inside the
   autodoc markers.

## 12. Accepted trade-offs and known deviations

- **Em-dash in three published posts.** The skill bans the character everywhere; rewriting
  published prose is a content change, so the posts keep theirs and the deviation is
  recorded rather than hidden.
- **The sprite is code-authored.** Honest limit: clean and readable, not Emerald-grade.
  The upgrade path in 5.2 is a one-file swap, and external art in a separate task remains
  the route to the highest quality.
- **A scene hero still costs something.** It is heavier than a text hero: more DOM, more
  paint, and a sprite to keep pixel-crisp. The mitigation is that it fits the viewport, the
  content below is unaffected, and the starfield animates only transform and opacity. The
  gate version was rejected for SEO, accessibility and one-click recruiter access.
- **Dual mode doubles colour QA.** Accepted by the owner, and it is why section 10 has a
  both-themes gate.
- **`/cv` breaks three pinned assertions** in `tests/metadata-routes.test.ts`. Deliberate,
  updated in the same commit, and recorded in `docs/TROUBLESHOOTING.md`.
- **`output: "export"` plus an experimental flag.** View transitions are only kept if
  check 1 in section 10 passes.

## 13. Waiting on the owner

Nothing here blocks slice 1. These arrive later and each costs one file or one array:

- the CV PDF for `public/`, to turn `View CV` into a real download
- photos for `public/gallery/`
- rack photos for `public/homelab/`
- the hero photograph, or confirmation that the sprite scene is the hero image
- optionally, an externally generated sprite to replace the code-authored one
