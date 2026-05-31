import type { Metadata } from "next";
import Image from "next/image";
import { Music, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Music — Francesco Tenace",
  description: "What I'm listening to lately, pulled from Last.fm.",
};

// Under `output: 'export'` (GitHub Pages), pages are built once per deploy.
// A scheduled GitHub Actions cron rebuilds the site hourly to refresh this feed.

type LastFmImage = { size: string; "#text": string };
type LastFmTrack = {
  name: string;
  artist: { "#text": string } | { name: string };
  url: string;
  image: LastFmImage[];
  date?: { "#text": string };
  "@attr"?: { nowplaying?: string };
};

type RecentTracksResponse = {
  recenttracks?: { track?: LastFmTrack[] };
};

const FALLBACK_ARTISTS: { name: string; note: string }[] = [
  { name: "Steven Wilson", note: "Modern prog rock that scratches the itch." },
  { name: "Pink Floyd", note: "Forever in rotation." },
  { name: "King Crimson", note: "The good kind of difficult." },
  { name: "Daft Punk", note: "When the homelab needs a deploy soundtrack." },
];

function artistName(t: LastFmTrack): string {
  const a = t.artist as { "#text"?: string; name?: string };
  return a["#text"] ?? a.name ?? "Unknown";
}

function pickImage(images: LastFmImage[] | undefined): string | null {
  if (!images?.length) return null;
  const large = images.find((i) => i.size === "extralarge" || i.size === "large");
  const url = (large ?? images[images.length - 1])["#text"];
  return url || null;
}

async function fetchRecent(): Promise<LastFmTrack[] | null> {
  const key = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;
  if (!key || !user) return null;

  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", key);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "12");

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
  const tracks = await fetchRecent();

  return (
    <>
      <PageHeader
        eyebrow="now playing"
        title="Music"
        description={
          tracks
            ? "Recently played, pulled live from my Last.fm account."
            : "A short list of artists in heavy rotation. Set LASTFM_API_KEY and LASTFM_USER to show live scrobbles."
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {tracks && tracks.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((t, i) => {
              const img = pickImage(t.image);
              const isNow = t["@attr"]?.nowplaying === "true";
              return (
                <li key={`${t.url}-${i}`}>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 transition-colors hover:border-emerald-500/50"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                      {img ? (
                        <Image
                          src={img}
                          alt={`${t.name} cover`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <Music className="absolute inset-0 m-auto h-6 w-6 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100 group-hover:text-emerald-300">
                        {t.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {artistName(t)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">
                        {isNow ? "▶ now playing" : t.date?.["#text"] ?? ""}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 self-start text-slate-600" />
                  </a>
                </li>
              );
            })}
          </ul>
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
