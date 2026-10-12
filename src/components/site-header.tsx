"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NAV_LINKS, isActiveHref } from "@/lib/nav";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * One line at desktop; below `md` the same header expands in flow to reveal a stacked
 * menu (not an overlay drawer), so it never covers the page and needs no scroll lock. The
 * active link is marked with `aria-current`, which is also what the styling keys off, so
 * the visual state and the announced state cannot drift apart.
 *
 * The panel remembers the pathname it was opened at rather than a bare boolean. When the
 * path changes, the remembered path is reset during render (the documented React pattern
 * for resetting state when an input changes), so the panel closes on any navigation -
 * a menu link, the brand, and back/forward alike. That reset is a guarded render-phase
 * state adjustment rather than a `setOpen(false)` effect, which would trip this repo's
 * `react-hooks/set-state-in-effect` rule. Escape closes it too, handled in an effect so
 * the key is only listened for while the panel is open.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpenAt(null);
  }
  const open = openAt !== null && openAt === pathname;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenAt(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="site-header border-line bg-surface/85 sticky top-0 z-40 border-b backdrop-blur"
    >
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
