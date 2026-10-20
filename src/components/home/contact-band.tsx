import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { CONTACT_EMAIL } from "@/lib/cv-data";
import { CONTACT_LABEL } from "@/lib/nav";

/**
 * The site's single contact call to action. The same label appears in the footer, which
 * is the one repetition the rule allows: same intent, so same words.
 */
export function ContactBand() {
  return (
    <section className="border-line border-t">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <h2 className="font-display text-ink max-w-[24ch] text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
            Say hello, or hire me
          </h2>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="focus-ring bg-accent text-accent-ink mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <EnvelopeSimple size={16} weight="regular" aria-hidden />
            {CONTACT_LABEL}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
