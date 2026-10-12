"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { MapPin, CalendarBlank } from "@phosphor-icons/react";
import type { Experience } from "@/lib/cv-data";

/**
 * One sticky card per role: each pins near the top and the ones underneath shrink and dim
 * as the next arrives, so the list reads as a sequence rather than a scroll of boxes.
 *
 * Motion only, no scroll hijack and no scroll listener. The scale is driven by each card's
 * own progress, so there is nothing to fight with CSS `position: sticky`.
 */
function StackCard({
  experience,
  index,
  isLast,
}: {
  experience: Experience;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.55]);

  return (
    <article
      ref={ref}
      style={{ zIndex: index + 1 }}
      className="sticky top-24 mb-6 last:mb-0 motion-reduce:static"
    >
      <motion.div
        style={reduce || isLast ? undefined : { scale, opacity }}
        className="border-line bg-panel rounded-panel border p-6 md:p-8"
      >
        <div className="text-ink-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlank size={14} weight="regular" aria-hidden />
            <span className="tabular">{experience.period}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} weight="regular" aria-hidden />
            {experience.location}
          </span>
        </div>
        <h3 className="font-display text-ink mt-3 text-xl font-semibold tracking-tight">
          {experience.role}
        </h3>
        <p className="text-accent mt-1 text-sm font-medium">{experience.company}</p>
        <p className="text-ink-muted mt-3 max-w-[65ch] text-sm leading-relaxed">
          {experience.description}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {experience.tech.map((tech) => (
            <li
              key={tech}
              className="border-line bg-sunken text-ink-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
            >
              {tech}
            </li>
          ))}
        </ul>
      </motion.div>
    </article>
  );
}

export function ExperienceStack({ experiences }: { experiences: Experience[] }) {
  return (
    <div>
      {experiences.map((experience, index) => (
        <StackCard
          key={`${experience.company}-${experience.period}`}
          experience={experience}
          index={index}
          isLast={index === experiences.length - 1}
        />
      ))}
    </div>
  );
}
