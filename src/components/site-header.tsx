import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/music", label: "Music" },
  { href: "/homelab", label: "Homelab" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-mono text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          ~/ft
        </Link>
        <nav>
          <ul className="flex flex-wrap items-center gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-emerald-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
