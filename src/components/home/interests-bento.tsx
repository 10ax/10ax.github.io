import Link from "next/link";
import { ArrowUpRight, Broadcast, Disc, GameController, Terminal } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { Sprite } from "@/components/scene/sprite";

/**
 * Five interests, five cells on a three-column track: the lead music cell spans two
 * columns and the other four are single cells, so six column-units fill two complete rows
 * with no empty cell. The starfield tile and the sprite tile are the two cells that carry
 * real visual variation beyond a text panel.
 */
export function InterestsBento() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          The things I keep coming back to
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {/* Lead cell: music, spanning two columns. A panel with a Disc icon and an arrow,
            linked to the page fed by the real scrobble feed. */}
        <Reveal className="md:col-span-2">
          <Link
            href="/music"
            className="focus-ring group border-line bg-panel hover:border-accent flex h-full flex-col justify-between rounded-panel border p-6 transition-colors"
          >
            <div className="flex items-center justify-between">
              <Disc size={20} weight="regular" aria-hidden className="text-accent" />
              <ArrowUpRight size={16} weight="regular" aria-hidden className="text-ink-muted" />
            </div>
            <div className="mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                Progressive rock
              </h3>
              <p className="text-ink-muted mt-2 max-w-[45ch] text-sm leading-relaxed">
                Long songs, odd time signatures, and a scrobble feed that has been running
                since before this site existed.
              </p>
            </div>
          </Link>
        </Reveal>

        {/* Space: a sunken tile with a starfield drawn from the same `--star` token the
            hero scene uses. */}
        <Reveal delay={0.05}>
          <div className="border-line bg-sunken relative flex h-full flex-col justify-between overflow-hidden rounded-panel border p-6">
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(2px 2px at 30% 20%, var(--star), transparent 60%), radial-gradient(2px 2px at 75% 45%, var(--star), transparent 60%), radial-gradient(1px 1px at 55% 80%, var(--star), transparent 60%)",
              }}
            />
            <Broadcast size={20} weight="regular" aria-hidden className="text-accent relative" />
            <div className="relative mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">Space</h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                The reason half this site is dark, and the reason the other half has stars
                in it.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Second row, first cell: the Game Boy era, a plain panel. */}
        <Reveal delay={0.1}>
          <div className="border-line bg-panel flex h-full flex-col justify-between rounded-panel border p-6">
            <GameController size={20} weight="regular" aria-hidden className="text-accent" />
            <div className="mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                The Game Boy era
              </h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                Sixteen pixels wide, eight colours, and more personality than most modern
                interfaces manage.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Second row, second cell: Linux, linked to the homelab. */}
        <Reveal delay={0.15}>
          <Link
            href="/homelab"
            className="focus-ring group border-line bg-panel hover:border-accent flex h-full flex-col justify-between rounded-panel border p-6 transition-colors"
          >
            <Terminal size={20} weight="regular" aria-hidden className="text-accent" />
            <div className="mt-10">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                Linux
              </h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">
                Arch on the desktop and on the tiny server in the corner. If it can be
                self-hosted, it probably is.
              </p>
            </div>
          </Link>
        </Reveal>

        {/* Second row, third cell: writing, linked to the blog. The site's sprite sits in
            the tile's top-right corner as the cell's visual variation. */}
        <Reveal delay={0.2}>
          <Link
            href="/blog"
            className="focus-ring group border-line bg-panel hover:border-accent relative flex h-full min-h-[180px] flex-col justify-end overflow-hidden rounded-panel border transition-colors"
          >
            {/* The site's own sprite, drawn by the shared Sprite component: one 64x96 frame
                of the idle strip, stepped by CSS. `aria-hidden` is built in. */}
            <Sprite state="idle" className="absolute top-6 right-8 opacity-90" />
            <div className="p-6">
              <h3 className="font-display text-ink text-xl font-semibold tracking-tight">
                Writing it down
              </h3>
              <p className="text-ink-muted mt-2 max-w-[45ch] text-sm leading-relaxed">
                Half the things I build only make sense once I have written them up, so
                that is where they end up.
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
