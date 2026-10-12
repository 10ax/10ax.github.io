import { EnvelopeSimple, Rss } from "@phosphor-icons/react/dist/ssr";
import { CONTACT_LABEL } from "@/lib/nav";

const EMAIL = "ftenace98@gmail.com";

export function SiteFooter() {
  return (
    <footer className="border-line border-t">
      <div className="text-ink-muted mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-3 px-5 py-8 text-xs sm:flex-row sm:items-center md:px-8">
        <p>© {new Date().getFullYear()} Francesco Tenace</p>
        <div className="flex items-center gap-5">
          <a
            href={`mailto:${EMAIL}`}
            className="focus-ring hover:text-ink inline-flex items-center gap-1.5 transition-colors"
          >
            <EnvelopeSimple size={14} weight="regular" aria-hidden />
            {CONTACT_LABEL}
          </a>
          <a
            href="/sitemap.xml"
            className="focus-ring hover:text-ink inline-flex items-center gap-1.5 transition-colors"
          >
            <Rss size={14} weight="regular" aria-hidden />
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
