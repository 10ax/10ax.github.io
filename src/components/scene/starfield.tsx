"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The scene backdrop: a fixed, full-viewport star field behind every route.
 *
 * Two depths. The far field is three tiled gradient layers that drift slowly with the page,
 * which reads as distance. Over it, sixty-four stars stream outward from the centre of the
 * viewport, growing as they pass the observer, which is what reads as travelling forward.
 *
 * The star table is generated from a fixed seed at module scope, so the server and the client
 * render the identical field. A `Math.random()` field would differ between the two and break
 * hydration. Only `transform` and `opacity` animate, the layer is `pointer-events-none` and
 * `aria-hidden`, and `-z-10` puts it above the body's background but below every in-flow
 * element, so no page needs to know it exists.
 *
 * Under `prefers-reduced-motion` the streaming stops and is not rendered at all; the far
 * gradient layers remain as a static field.
 */
const FAR_LAYERS = [
  { size: "3px 3px", alpha: 0.55, distance: -40, tile: "180px 180px" },
  { size: "2px 2px", alpha: 0.35, distance: -80, tile: "120px 120px" },
  { size: "1px 1px", alpha: 0.22, distance: -130, tile: "90px 90px" },
] as const;

/** How many stars stream past at once. Enough to read as a field, few enough for a phone. */
const WARP_STAR_COUNT = 64;

type WarpStar = {
  id: number;
  dx: string;
  dy: string;
  duration: string;
  delay: string;
  size: number;
  accent: boolean;
};

/**
 * A deterministic field: linear congruential generator, fixed seed, no `Math.random`.
 * Angles are spread evenly and jittered, so the field is radially even without clumping.
 */
const WARP_STARS: WarpStar[] = (() => {
  let seed = 20261012;
  const next = (): number => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  return Array.from({ length: WARP_STAR_COUNT }, (_, id) => {
    // Even slice per star, jittered inside the slice, so no two stars travel the same line.
    const angle = ((id + next()) / WARP_STAR_COUNT) * Math.PI * 2;
    const reach = 34 + next() * 46;
    return {
      id,
      dx: `${(Math.cos(angle) * reach).toFixed(2)}vmax`,
      dy: `${(Math.sin(angle) * reach).toFixed(2)}vmax`,
      duration: `${(2.4 + next() * 2.6).toFixed(2)}s`,
      // Negative delay: every star is already mid-flight on the first frame, so the field
      // never starts as an empty centre and fills up.
      delay: `${(-next() * 6).toFixed(2)}s`,
      size: next() < 0.75 ? 2 : 3,
      accent: next() < 0.18,
    };
  });
})();

export function Starfield() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const near = useTransform(scrollYProgress, [0, 1], [0, FAR_LAYERS[0].distance]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, FAR_LAYERS[1].distance]);
  const far = useTransform(scrollYProgress, [0, 1], [0, FAR_LAYERS[2].distance]);
  const offsets = reduce ? [0, 0, 0] : [near, mid, far];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {FAR_LAYERS.map((layer, index) => (
        <motion.div
          key={layer.tile}
          style={{
            y: offsets[index],
            opacity: layer.alpha,
            backgroundSize: layer.tile,
            backgroundImage: `radial-gradient(${layer.size} at 20% 30%, var(--star), transparent 60%),
              radial-gradient(${layer.size} at 70% 15%, var(--star), transparent 60%),
              radial-gradient(${layer.size} at 45% 70%, var(--star), transparent 60%),
              radial-gradient(${layer.size} at 85% 55%, var(--star), transparent 60%)`,
          }}
          className="absolute inset-0"
        />
      ))}

      {/* Vanishing point. Stars start here and are pushed outward by their own keyframes. */}
      <div className="absolute top-1/2 left-1/2">
        {WARP_STARS.map((star) => (
          <span
            key={star.id}
            className={`star-warp absolute rounded-full ${star.accent ? "bg-accent" : "bg-star"}`}
            style={
              {
                width: `${star.size}px`,
                height: `${star.size}px`,
                marginLeft: `${-star.size / 2}px`,
                marginTop: `${-star.size / 2}px`,
                "--dx": star.dx,
                "--dy": star.dy,
                "--dur": star.duration,
                "--delay": star.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
