import type { Metadata } from "next";
import { Music } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
        description={
          initial
            ? "Recently played, pulled live from my Last.fm account. Scroll for more."
            : "A short list of artists in heavy rotation. Set NEXT_PUBLIC_LASTFM_API_KEY and NEXT_PUBLIC_LASTFM_USER to show live scrobbles."
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {initial && initial.length > 0 ? (
          <TrackList initialTracks={initial} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FALLBACK_ARTISTS.map((a) => (
              <li
                key={a.name}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-slate-100">{a.name}</h2>
                </div>
                <p className="mt-1 text-sm text-slate-400">{a.note}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
