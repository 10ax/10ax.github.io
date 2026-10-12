export type NavLink = { href: string; label: string };

/**
 * The site's navigation, in order. `CV` is the one addition the redesign makes; the other
 * five labels are byte-identical to what the site shipped before, because they are the
 * crawl surface and the owner's muscle memory.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/cv", label: "CV" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/music", label: "Music" },
  { href: "/homelab", label: "Homelab" },
] as const;

/**
 * The single contact-intent label. One label per intent: this string is the only
 * contact call to action on the site, and it is reused verbatim wherever contact appears.
 */
export const CONTACT_LABEL = "Get in touch";

/**
 * Whether `href` is the current section for `pathname`.
 *
 * Home matches only the exact home path. Every other link matches its own path and any
 * nested path under it (`/blog/welcome` belongs to `/blog`), but not a path that merely
 * starts with the same letters (`/blogging` is not `/blog`).
 */
export function isActiveHref(pathname: string, href: string): boolean {
  const normalise = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  const path = normalise(pathname);
  const target = normalise(href);
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}
