"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";

export type LightboxPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

/**
 * The in-page photo viewer.
 *
 * In-page rather than a route, so no new URL, no new indexed page and no change to the
 * information architecture. Keyboard: Escape closes, the arrows move. Focus is moved into
 * the dialog and returned to whatever opened it, and the background is not reachable while
 * it is open, which is what `aria-modal` promises.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: LightboxPhoto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  const open = index !== null;

  /*
   * Focus is its own effect, keyed only on whether the dialog is open, so it moves in once
   * on open and back out exactly once on close. Folding it into the key-listener effect
   * (which re-runs on every navigation) would pull focus onto the thumbnail mid-gallery and
   * scroll the page behind the dialog.
   */
  useEffect(() => {
    if (!open) {
      (returnFocusRef.current as HTMLElement | null)?.focus?.();
      returnFocusRef.current = null;
      return;
    }
    returnFocusRef.current = document.activeElement;
    dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const current: number = index;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate((current + 1) % photos.length);
      if (event.key === "ArrowLeft") onNavigate((current - 1 + photos.length) % photos.length);
      if (event.key === "Tab") {
        // Cycle inside the dialog: the close and arrow buttons, never the page behind it.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        // Focus sits on the dialog container itself (tabIndex={-1}) on open and after every
        // navigation, so Shift+Tab from there must be caught too: otherwise it walks to the
        // previous tabbable element in DOM order, a thumbnail behind the overlay.
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, onClose, onNavigate, photos.length]);

  if (index === null) return null;
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="lightbox-scrim fixed inset-0 z-[70] flex items-center justify-center bg-scrim p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={photo.caption ?? photo.alt}
        tabIndex={-1}
        className="border-line bg-panel relative max-h-full w-full max-w-4xl overflow-hidden rounded-panel border"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          unoptimized
          className="max-h-[75vh] w-full object-contain"
        />
        {photo.caption && (
          <p className="text-ink-muted px-4 py-3 text-xs">{photo.caption}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="focus-ring bg-surface/80 text-ink absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full"
        >
          <X size={18} weight="regular" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
          aria-label="Previous photo"
          className="focus-ring bg-surface/80 text-ink absolute top-1/2 left-3 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <CaretLeft size={18} weight="regular" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index + 1) % photos.length)}
          aria-label="Next photo"
          className="focus-ring bg-surface/80 text-ink absolute top-1/2 right-3 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <CaretRight size={18} weight="regular" aria-hidden />
        </button>
      </div>
    </div>
  );
}
