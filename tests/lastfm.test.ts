/**
 * Characterisation tests for the shared Last.fm helpers.
 *
 * The hub, the `/music` route and the client-side scroller read the same feed, and the image
 * rule is the part they used to disagree on: one copy preferred `extralarge`/`large` and gave
 * up when neither was populated, the other fell back to the last entry. These tests pin the
 * single rule that replaced both.
 */
import { describe, expect, it } from "vitest";
import { artistName, pickImage, recentTracksUrl, type LastFmImage, type LastFmTrack } from "@/lib/lastfm";

const image = (size: string, url: string): LastFmImage => ({ size, "#text": url });

describe("recentTracksUrl", () => {
  it("asks for one page of recent tracks with the credentials it was given", () => {
    const url = recentTracksUrl({ apiKey: "key", user: "someone", limit: 2 });
    expect(url.origin + url.pathname).toBe("https://ws.audioscrobbler.com/2.0/");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      method: "user.getrecenttracks",
      user: "someone",
      api_key: "key",
      format: "json",
      limit: "2",
    });
  });

  it("omits the page parameter until a page is asked for", () => {
    expect(recentTracksUrl({ apiKey: "k", user: "u", limit: 50 }).searchParams.has("page")).toBe(
      false,
    );
    expect(
      recentTracksUrl({ apiKey: "k", user: "u", limit: 50, page: 3 }).searchParams.get("page"),
    ).toBe("3");
  });
});

describe("pickImage", () => {
  it("takes the first large or extralarge entry in the feed's own order", () => {
    expect(
      pickImage([image("large", "large.jpg"), image("extralarge", "xl.jpg")]),
    ).toBe("large.jpg");
    expect(
      pickImage([image("small", "small.jpg"), image("extralarge", "xl.jpg")]),
    ).toBe("xl.jpg");
  });

  it("falls back to the last entry when no large variant is present", () => {
    const images = [image("small", "small.jpg"), image("medium", "medium.jpg")];
    expect(pickImage(images)).toBe("medium.jpg");
  });

  it("returns null for an empty or missing list, and for an empty url", () => {
    expect(pickImage(undefined)).toBeNull();
    expect(pickImage([])).toBeNull();
    expect(pickImage([image("large", "")])).toBeNull();
  });
});

describe("artistName", () => {
  const track = (artist: LastFmTrack["artist"]): LastFmTrack => ({
    name: "A track",
    artist,
    url: "https://www.last.fm/music/x",
  });

  it("prefers the scrobble's own text and falls back to the artist name", () => {
    expect(artistName(track({ "#text": "Steven Wilson" }))).toBe("Steven Wilson");
    expect(artistName(track({ name: "King Crimson" }))).toBe("King Crimson");
    expect(artistName(track({}))).toBe("Unknown");
  });
});
