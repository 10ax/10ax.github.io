"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";

/**
 * The primary call to action. It leans toward the cursor by a few pixels, which is
 * feedback that the element is live, and it springs back on leave.
 *
 * The pull is a motion value plus a spring, so the React tree is not re-rendered while
 * the pointer moves. Under reduced motion it is a plain link.
 */
export function MagneticCta({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 120, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 120, damping: 15 });

  const base =
    "focus-ring bg-accent text-accent-ink inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";
  const classes = `${base} ${className ?? ""}`;

  if (reduce) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div
      style={{ x, y }}
      className="inline-block"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * 12);
        y.set(((event.clientY - rect.top) / rect.height - 0.5) * 12);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Link href={href} className={classes}>
        {children}
      </Link>
    </motion.div>
  );
}
