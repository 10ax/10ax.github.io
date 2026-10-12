"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Three star layers at different parallax speeds, which is what reads as depth.
 *
 * The layers are CSS gradients, not hundreds of elements: the DOM cost of a starfield
 * built from divs is the thing that makes it janky on a phone. Only `transform` moves,
 * and only via a scroll-linked motion value, never a scroll listener.
 */
const LAYERS = [
  { size: "3px 3px", alpha: 0.55, distance: -40, tile: "180px 180px" },
  { size: "2px 2px", alpha: 0.35, distance: -80, tile: "120px 120px" },
  { size: "1px 1px", alpha: 0.22, distance: -130, tile: "90px 90px" },
] as const;

export function Starfield({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const near = useTransform(scrollYProgress, [0, 1], [0, LAYERS[0].distance]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, LAYERS[1].distance]);
  const far = useTransform(scrollYProgress, [0, 1], [0, LAYERS[2].distance]);
  const offsets = reduce ? [0, 0, 0] : [near, mid, far];

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {LAYERS.map((layer, index) => (
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
    </div>
  );
}
