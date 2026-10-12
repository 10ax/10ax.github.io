import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

export type ListeningItem = {
  name: string;
  artist: string;
  url: string;
  image?: string;
};

/**
 * Two recent scrobbles as a quiet strip. Real data from the build, no invented numbers, and
 * it exists whether or not Last.fm credentials are present because the caller falls back to
 * the static artist list.
 */
export function ListeningStrip({ tracks }: { tracks: ListeningItem[] }) {
  if (tracks.length === 0) return null;

  return (
    <section className="border-line border-t">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-14 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-ink text-2xl font-semibold tracking-tight">
              Recently played
            </h2>
            <Link
              href="/music"
              className="focus-ring text-accent inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              All listening
              <ArrowUpRight size={16} weight="regular" aria-hidden />
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {tracks.slice(0, 2).map((track, index) => (
              <li key={`${track.url}-${index}`}>
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group flex items-center gap-3"
                >
                  <span className="bg-sunken border-line relative h-12 w-12 shrink-0 overflow-hidden rounded-chip border">
                    {track.image ? (
                      <Image
                        src={track.image}
                        alt={`${track.name} cover`}
                        fill
                        sizes="48px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="text-ink group-hover:text-accent block truncate text-sm font-semibold transition-colors">
                      {track.name}
                    </span>
                    <span className="text-ink-muted block truncate text-xs">{track.artist}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
