import type { Metadata } from "next";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { PixelLabel } from "@/components/pixel-label";
import { MagneticCta } from "@/components/magnetic-cta";
import { Starfield } from "@/components/scene/starfield";
import { Sprite } from "@/components/scene/sprite";
import { HubMenu } from "@/components/scene/hub-menu";
import { NowStrip } from "@/components/home/now-strip";
import { InterestsBento } from "@/components/home/interests-bento";
import { HomelabBand } from "@/components/home/homelab-band";
import { LatestWriting } from "@/components/home/latest-writing";
import { ListeningStrip, type ListeningItem } from "@/components/home/listening-strip";
import { ContactBand } from "@/components/home/contact-band";
import { getAllPosts } from "@/lib/posts";
import { CV_DATA } from "@/lib/cv-data";

export const metadata: Metadata = {
  title: "Francesco Tenace | Full-stack developer, Linux and long songs",
  description:
    "Full-stack developer building distributed systems by day, running a small homelab by night. Progressive rock, retro pixels, and too much Arch Linux.",
};

/** The fallback list when Last.fm credentials are absent, same as the music route. */
const FALLBACK_TRACKS: ListeningItem[] = [
  { name: "Ancestral", artist: "Steven Wilson", url: "https://www.last.fm/music/Steven+Wilson" },
  { name: "Red", artist: "King Crimson", url: "https://www.last.fm/music/King+Crimson" },
];

async function recentListening(): Promise<ListeningItem[]> {
  const key = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  const user = process.env.NEXT_PUBLIC_LASTFM_USER;
  if (!key || !user) return FALLBACK_TRACKS;

  try {
    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", key);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "2");
    const res = await fetch(url);
    if (!res.ok) return FALLBACK_TRACKS;
    const data = (await res.json()) as {
      recenttracks?: {
        track?: {
          name: string;
          url: string;
          artist: { "#text"?: string; name?: string };
          image?: { size: string; "#text": string }[];
        }[];
      };
    };
    const tracks = data.recenttracks?.track ?? [];
    const mapped = tracks.map((track) => {
      const large = track.image?.find((i) => i.size === "extralarge" || i.size === "large");
      return {
        name: track.name,
        artist: track.artist["#text"] ?? track.artist.name ?? "Unknown",
        url: track.url,
        image: large?.["#text"] || undefined,
      };
    });
    return mapped.length > 0 ? mapped : FALLBACK_TRACKS;
  } catch {
    return FALLBACK_TRACKS;
  }
}

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 4);
  const tracks = await recentListening();

  /*
   * Identity only. The CV-specific structured data (`hasOccupation`) lives on `/cv`,
   * so the two pages do not both claim to be a CV. The facts come from the same source
   * either way, so they cannot drift.
   */
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CV_DATA.profile.name,
    jobTitle: CV_DATA.profile.title,
    email: `mailto:${CV_DATA.profile.email}`,
    sameAs: ["https://github.com/10ax"],
    knowsLanguage: CV_DATA.profile.languages.map((language) => language.name),
    knowsAbout: CV_DATA.skills.map((skill) => skill.name),
    alumniOf: { "@type": "CollegeOrUniversity", name: CV_DATA.education.institution },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: the object is fully controlled and JSON.stringify escapes it for JSON-LD.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Hero scene. Fits the initial viewport: no scroll cue, no gate, and the
          destination menu is inside it, so a recruiter reaches the CV in one click and a
          crawler reaches it in one hop. */}
      <header className="relative isolate overflow-hidden pt-14 pb-14 md:pt-24 md:pb-28">
        <Starfield />
        <div className="relative mx-auto grid w-full max-w-[1400px] gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <PixelLabel>whoami</PixelLabel>
            <h1 className="font-display text-ink mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
              Francesco Tenace
            </h1>
            <p className="text-ink-muted mt-4 max-w-[65ch] text-lg leading-relaxed text-pretty">
              Full-stack developer. I build distributed systems for a living and keep a
              small rack alive for fun.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticCta href="/cv">View CV</MagneticCta>
              <a
                href="https://github.com/10ax"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring border-line hover:border-line-strong inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <GithubLogo size={16} weight="regular" aria-hidden />
                GitHub
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Sprite state="idle" className="lg:scale-125" />
            <HubMenu className="w-full" />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1">
        <NowStrip />
        <InterestsBento />
        <HomelabBand />
        <LatestWriting
          posts={posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            description: post.description,
          }))}
        />
        <ListeningStrip tracks={tracks} />
        <ContactBand />
      </main>
    </>
  );
}
