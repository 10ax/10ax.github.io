import type { Metadata } from "next";
import { MusicNotes } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { TrackList, type LastFmTrack } from "@/components/track-list";

export const metadata: Metadata = {
  title: "Music — Francesco Tenace",
  description: "What I'm listening to lately, pulled from Last.fm.",
};

// Under `output: 'export'` (GitHub Pages), the initial page is generated once per deploy.
// A scheduled GitHub Actions cron rebuilds the site hourly to refresh this feed.
// Client-side infinite scroll fetches additional pages live from Last.fm.

const FALLBACK_ARTISTS: { name: string; note: string }[] = [
  { name: "Steven Wilson", note: "Modern prog rock that scratches the itch." },
  { name: "Pink Floyd", note: "Forever in rotation." },
  { name: "King Crimson", note: "The good kind of difficult." },
  { name: "Daft Punk", note: "When the homelab needs a deploy soundtrack." },
];

type RecentTracksResponse = {
  recenttracks?: { track?: LastFmTrack[] };
};

const INITIAL_PAGE_SIZE = 50;

async function fetchInitial(): Promise<LastFmTrack[] | null> {
  const key = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  const user = process.env.NEXT_PUBLIC_LASTFM_USER;
  if (!key || !user) return null;

  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", key);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(INITIAL_PAGE_SIZE));

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as RecentTracksResponse;
    return data.recenttracks?.track ?? null;
  } catch {
    return null;
  }
}

export default async function MusicPage() {
  const initial = await fetchInitial();

  return (
    <>
      <PageHeader
        eyebrow="now playing"
        title="Music"
        description="Long songs, odd time signatures, and a scrobble feed that predates this site."
      />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        {initial && initial.length > 0 ? (
          <TrackList initialTracks={initial} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {FALLBACK_ARTISTS.map((artist, index) => (
              <li key={artist.name}>
                <Reveal delay={index * 0.05} className="h-full">
                  <div className="border-line bg-panel h-full rounded-panel border p-5">
                    <div className="flex items-center gap-2">
                      <MusicNotes size={18} weight="regular" aria-hidden className="text-accent" />
                      <h2 className="font-display text-ink text-base font-semibold tracking-tight">
                        {artist.name}
                      </h2>
                    </div>
                    <p className="text-ink-muted mt-2 text-sm leading-relaxed">{artist.note}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
