"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MusicNotes, ArrowSquareOut } from "@phosphor-icons/react";
import {
  artistName,
  pickImage,
  recentTracksUrl,
  type LastFmTrack,
  type RecentTracksResponse,
} from "@/lib/lastfm";

const PAGE_SIZE = 50;
const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
const USER = process.env.NEXT_PUBLIC_LASTFM_USER;

function trackKey(t: LastFmTrack, page: number, i: number): string {
  return `${t.url}-${t.date?.["#text"] ?? "now"}-${page}-${i}`;
}

async function fetchPage(page: number): Promise<LastFmTrack[]> {
  if (!API_KEY || !USER) return [];
  const res = await fetch(recentTracksUrl({ apiKey: API_KEY, user: USER, limit: PAGE_SIZE, page }));
  if (!res.ok) return [];
  const data = (await res.json()) as RecentTracksResponse;
  return data.recenttracks?.track ?? [];
}

/** A skeleton row shaped like a real row, so loading looks like the content. */
function SkeletonRow() {
  return (
    <li className="border-line flex items-center gap-3 border-b py-3">
      <span className="bg-sunken border-line h-12 w-12 shrink-0 animate-pulse rounded-chip border motion-reduce:animate-none" />
      <span className="flex-1">
        <span className="bg-sunken block h-3.5 w-3/5 animate-pulse rounded motion-reduce:animate-none" />
        <span className="bg-sunken mt-2 block h-3 w-2/5 animate-pulse rounded motion-reduce:animate-none" />
      </span>
    </li>
  );
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
      <ul className="border-line border-t">
        {pages.flatMap((page, pageIndex) =>
          page.map((track, index) => {
            const image = pickImage(track.image);
            const isNow = track["@attr"]?.nowplaying === "true";
            return (
              <li key={trackKey(track, pageIndex, index)} className="border-line border-b">
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group flex items-center gap-3 py-3"
                >
                  <span className="bg-sunken border-line relative h-12 w-12 shrink-0 overflow-hidden rounded-chip border">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${track.name} cover`}
                        fill
                        sizes="48px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <MusicNotes
                        size={18}
                        weight="regular"
                        aria-hidden
                        className="text-ink-muted absolute inset-0 m-auto"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink group-hover:text-accent block truncate text-sm font-semibold transition-colors">
                      {track.name}
                    </span>
                    <span className="text-ink-muted block truncate text-xs">{artistName(track)}</span>
                  </span>
                  <span className="text-ink-muted tabular hidden shrink-0 font-mono text-xs sm:block">
                    {isNow ? "now playing" : (track.date?.["#text"] ?? "")}
                  </span>
                  <ArrowSquareOut
                    size={14}
                    weight="regular"
                    aria-hidden
                    className="text-ink-muted shrink-0"
                  />
                </a>
              </li>
            );
          }),
        )}
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
      </ul>

      <div ref={sentinelRef} className="text-ink-muted py-6 text-sm">
        {done && tracks.length > 0 && <span>That is the whole history I can fetch.</span>}
      </div>
    </>
  );
}
