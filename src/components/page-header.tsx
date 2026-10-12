import { PixelLabel } from "@/components/pixel-label";

/**
 * Every sub-route's masthead. The eyebrow is optional and renders the pixel micro-label;
 * at most one page in three may use it, so most callers omit it.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-line border-b">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        {eyebrow && (
          <p className="mb-3">
            <PixelLabel>{eyebrow}</PixelLabel>
          </p>
        )}
        <h1 className="font-display text-ink max-w-[20ch] text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-ink-muted mt-4 max-w-[65ch] text-base leading-relaxed text-pretty">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
