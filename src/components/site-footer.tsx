import { Mail, BookOpen } from "lucide-react";

const EMAIL = "ftenace98@gmail.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Francesco Tenace. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-300"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Imprint
          </a>
        </div>
      </div>
    </footer>
  );
}
