"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox, type LightboxPhoto } from "@/components/lightbox";

/**
 * A masonry grid using CSS columns, which is the one layout that keeps mixed aspect
 * ratios honest without a fixed row height.
 *
 * The grid is a client component only because the lightbox needs state; the images
 * themselves are plain `next/image` with `unoptimized` (the export has no optimiser).
 */
export function GalleryGrid({ photos }: { photos: LightboxPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <li key={photo.src} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="focus-ring group border-line block w-full overflow-hidden rounded-panel border"
              aria-label={`Open ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        photos={photos}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={(next) => setOpen(next)}
      />
    </>
  );
}
