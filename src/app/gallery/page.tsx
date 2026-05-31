import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Gallery — Francesco Tenace",
  description: "A small photo gallery.",
};

type Photo = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

// Drop image files into /public/gallery/ and reference them here.
const PHOTOS: Photo[] = [
  // Example placeholder using the existing public asset so the page renders out of the box.
  // Replace these with your own photos under /public/gallery/.
  { src: "/next.svg", alt: "Placeholder", width: 800, height: 600 },
  { src: "/vercel.svg", alt: "Placeholder", width: 800, height: 600 },
  { src: "/next.svg", alt: "Placeholder", width: 800, height: 600 },
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="ls ~/gallery"
        title="Gallery"
        description="A collection of photos. Drop images into /public/gallery/ and list them in app/gallery/page.tsx."
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((photo, i) => (
            <figure
              key={`${photo.src}-${i}`}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-colors hover:border-emerald-500/50"
            >
              <div className="relative aspect-[4/3] bg-slate-950">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {photo.caption && (
                <figcaption className="border-t border-slate-800 px-4 py-2 text-xs text-slate-400">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </main>
    </>
  );
}
