"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * A panel whose border carries a soft accent highlight that follows the cursor.
 *
 * The pointer position is a motion value, never React state: state here would re-render
 * the tree on every pointer move and stutter on a phone. Under reduced motion the
 * highlight is simply always present at its resting position.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${x}% ${y}%, var(--accent), transparent 70%)`;

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || reduce) return;
    const rect = node.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width) * 100);
    y.set(((event.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`border-line bg-panel relative overflow-hidden rounded-panel border p-5 ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        style={{ backgroundImage: glow }}
        className="pointer-events-none absolute inset-0 opacity-15"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
