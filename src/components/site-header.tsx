"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { NAV_LINKS, isActiveHref } from "@/lib/nav";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * One line at desktop, an off-canvas drawer below `md`. The active link is marked with
 * `aria-current`, which is also what the styling keys off, so the visual state and the
 * announced state cannot drift apart.
 *
 * The drawer remembers the pathname it was opened at rather than a bare boolean, so any
 * navigation (a drawer link, the brand, back/forward) closes it with no effect: the
 * remembered path simply stops matching. A `setOpen(false)` effect would trip this repo's
 * `react-hooks/set-state-in-effect` rule.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt !== null && openAt === pathname;

  return (
    <header className="border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-5 md:px-8">
        <Link
          href="/"
          className="focus-ring text-accent font-mono text-sm font-semibold"
          aria-label="Francesco Tenace, home"
        >
          ~/ft
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm whitespace-nowrap">
            {NAV_LINKS.map((link) => {
              const active = isActiveHref(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "focus-ring rounded-full px-3 py-1.5 transition-colors",
                      active
                        ? "bg-panel text-ink"
                        : "text-ink-muted hover:bg-panel hover:text-ink",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpenAt(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="site-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring text-ink-muted hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full md:hidden"
          >
            {open ? <X size={18} weight="regular" aria-hidden /> : <List size={18} weight="regular" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        id="site-drawer"
        hidden={!open}
        className="border-line bg-surface border-t md:hidden"
      >
        <ul className="mx-auto flex w-full max-w-[1400px] flex-col px-5 py-3">
          {NAV_LINKS.map((link) => {
            const active = isActiveHref(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "focus-ring block rounded-chip px-3 py-2 text-sm",
                    active ? "bg-panel text-ink" : "text-ink-muted",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
