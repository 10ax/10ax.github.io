import type { Metadata } from "next";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";
import { PixelLabel } from "@/components/pixel-label";

export const metadata: Metadata = {
  title: "Page not found | Francesco Tenace",
  description: "That URL is not on this site.",
};

export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-20 md:px-8">
      <PixelLabel>404</PixelLabel>
      <h1 className="font-display text-ink mt-3 max-w-[20ch] text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">
        Nothing is hosted at this address
      </h1>
      <p className="text-ink-muted mt-4 max-w-[65ch] text-base leading-relaxed">
        The path exists in no build of this site. Everything that does exist is below.
      </p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="focus-ring border-line hover:border-line-strong rounded-full border px-4 py-2 text-sm transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
