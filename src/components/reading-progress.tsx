"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * A hairline at the top of the viewport showing how much of the article is behind you.
 *
 * `useScroll` with no target tracks the document, which is exactly the article here. The
 * spring keeps it from jittering on trackpads. Under reduced motion the bar is collapsed
 * to zero width, so it never animates and never grows as you read.
 */
export function ReadingProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduce ? 0 : scaleX }}
      className="bg-accent fixed top-0 left-0 z-[70] h-0.5 w-full origin-left"
    />
  );
}
