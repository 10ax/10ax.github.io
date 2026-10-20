/**
 * The Last.fm feed, declared once.
 *
 * Three surfaces read the same endpoint: the `/music` route builds its first page, the hub's
 * listening strip reads the two most recent tracks, and `TrackList` pages through history in
 * the browser. They share the response types, the request URL and the image chooser here, so
 * there is one spelling of the endpoint and one rule for which cover to show.
 *
 * The credentials stay with the callers: `NEXT_PUBLIC_*` is inlined into the client bundle
 * only where it is referenced literally, which is what `track-list.tsx` relies on.
 */

export type LastFmImage = { size: string; "#text": string };

export type LastFmTrack = {
  name: string;
  artist: { "#text"?: string; name?: string };
  url: string;
  image?: LastFmImage[];
  date?: { "#text": string };
  "@attr"?: { nowplaying?: string };
};

export type RecentTracksResponse = {
  recenttracks?: { track?: LastFmTrack[] };
};

/** One page of `user.getrecenttracks`, at the newest end. */
export function recentTracksUrl(options: {
  apiKey: string;
  user: string;
  limit: number;
  page?: number;
}): URL {
  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("user", options.user);
  url.searchParams.set("api_key", options.apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(options.limit));
  if (options.page !== undefined) url.searchParams.set("page", String(options.page));
  return url;
}

/**
 * The cover the feed offers, at the same rule the site always used: the first entry that is
 * `extralarge` or `large`, and otherwise the last entry, which is the one Last.fm populates
 * even when the larger variants are empty strings. Note that Last.fm lists sizes ascending
 * (`small` … `extralarge`), so in a real payload the first match is `large`.
 */
export function pickImage(images: LastFmImage[] | undefined): string | null {
  if (!images?.length) return null;
  const large = images.find((image) => image.size === "extralarge" || image.size === "large");
  return (large ?? images[images.length - 1])["#text"] || null;
}

/** The artist name, which Last.fm sends under `#text` but sometimes only under `name`. */
export function artistName(track: LastFmTrack): string {
  return track.artist["#text"] ?? track.artist.name ?? "Unknown";
}
