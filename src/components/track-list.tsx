"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Music, ExternalLink, Loader2 } from "lucide-react";

export type LastFmImage = { size: string; "#text": string };
export type LastFmTrack = {
  name: string;
  artist: { "#text"?: string; name?: string };
  url: string;
  image: LastFmImage[];
  date?: { "#text": string };
  "@attr"?: { nowplaying?: string };
};

const PAGE_SIZE = 50;
const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
const USER = process.env.NEXT_PUBLIC_LASTFM_USER;

function trackKey(t: LastFmTrack, page: number, i: number): string {
  return `${t.url}-${t.date?.["#text"] ?? "now"}-${page}-${i}`;
}

function artistName(t: LastFmTrack): string {
  return t.artist["#text"] ?? t.artist.name ?? "Unknown";
}

function pickImage(images: LastFmImage[] | undefined): string | null {
  if (!images?.length) return null;
  const large = images.find((i) => i.size === "extralarge" || i.size === "large");
  const url = (large ?? images[images.length - 1])["#text"];
  return url || null;
}

async function fetchPage(page: number): Promise<LastFmTrack[]> {
  if (!API_KEY || !USER) return [];
  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("user", USER);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.recenttracks?.track ?? [];
}

export function TrackList({ initialTracks }: { initialTracks: LastFmTrack[] }) {
  const [pages, setPages] = useState<LastFmTrack[][]>([initialTracks]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialTracks.length < PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const nextPageRef = useRef(2);
  const canFetch = Boolean(API_KEY && USER);

  const loadMore = useCallback(async () => {
    if (loading || done || !canFetch) return;
    setLoading(true);
    const next = await fetchPage(nextPageRef.current);
    nextPageRef.current += 1;
    if (next.length === 0) {
      setDone(true);
    } else {
      setPages((prev) => [...prev, next]);
      if (next.length < PAGE_SIZE) setDone(true);
    }
    setLoading(false);
  }, [loading, done, canFetch]);

  useEffect(() => {
    if (!sentinelRef.current || done || !canFetch) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, done, canFetch]);

  const tracks = pages.flat();

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.flatMap((page, pi) =>
          page.map((t, i) => {
            const img = pickImage(t.image);
            const isNow = t["@attr"]?.nowplaying === "true";
            return (
              <li key={trackKey(t, pi, i)}>
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
                        unoptimized
                      />
                    ) : (
                      <Music className="absolute inset-0 m-auto h-6 w-6 text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100 group-hover:text-emerald-300">
                      {t.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">{artistName(t)}</p>
                    <p className="mt-1 font-mono text-[10px] text-slate-500">
                      {isNow ? "▶ now playing" : t.date?.["#text"] ?? ""}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 self-start text-slate-600" />
                </a>
              </li>
            );
          }),
        )}
      </ul>

      <div ref={sentinelRef} className="mt-8 flex justify-center py-6 text-sm text-slate-500">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more…
          </span>
        ) : done ? (
          tracks.length > 0 ? <span>No more tracks.</span> : null
        ) : canFetch ? (
          <span>Scroll for more</span>
        ) : null}
      </div>
    </>
  );
}
