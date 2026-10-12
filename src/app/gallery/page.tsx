import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { GalleryGrid } from "@/components/gallery-grid";

export const metadata: Metadata = {
  title: "Gallery | Francesco Tenace",
  description: "Photographs, mostly of places that needed walking to.",
};

/*
 * Photos live under /public/gallery/. The placeholders below are seeded so every slot
 * renders as a photograph rather than a logo while the real files are collected:
 * replace each entry with `{ src: "/gallery/<name>.jpg", alt: "...", width, height }`
 * and drop the file in. Varied aspect ratios are deliberate: the masonry grid needs them.
 */
const PHOTOS = [
  { src: "https://picsum.photos/seed/ft-coast/1600/1067", alt: "Placeholder photograph", width: 1600, height: 1067 },
  { src: "https://picsum.photos/seed/ft-ridge/1200/1600", alt: "Placeholder photograph", width: 1200, height: 1600 },
  { src: "https://picsum.photos/seed/ft-city/1600/1600", alt: "Placeholder photograph", width: 1600, height: 1600 },
  { src: "https://picsum.photos/seed/ft-desk/1600/900", alt: "Placeholder photograph", width: 1600, height: 900 },
  { src: "https://picsum.photos/seed/ft-rack/1200/1500", alt: "Placeholder photograph", width: 1200, height: 1500 },
  { src: "https://picsum.photos/seed/ft-night/1600/1000", alt: "Placeholder photograph", width: 1600, height: 1000 },
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photographs. Mostly places that needed walking to."
      />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <GalleryGrid photos={PHOTOS} />
      </main>
    </>
  );
}
