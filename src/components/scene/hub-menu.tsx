"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { NAV_LINKS } from "@/lib/nav";

/**
 * The destination menu, anchored to the hero scene.
 *
 * These are ordinary links with ordinary labels, which is the whole point: the hero reads
 * as a game menu but behaves like a website, so it stays crawlable, keyboard reachable and
 * screen-reader legible. Nothing on this page gates the content behind an interaction.
 */
const BLURB: Record<string, string> = {
  "/": "Start here",
  "/cv": "The professional record",
  "/blog": "Notes and write-ups",
  "/gallery": "Photographs",
  "/music": "What is playing",
  "/homelab": "The rack and what runs on it",
};

export function HubMenu({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <ul className={`grid grid-cols-2 gap-2 ${className ?? ""}`}>
      {NAV_LINKS.map((link, index) => (
        <motion.li
          key={link.href}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : 0.15 + index * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Link
            href={link.href}
            className="focus-ring border-line bg-panel/60 hover:border-accent group flex items-baseline justify-between gap-3 rounded-panel border px-4 py-3 transition-colors"
          >
            <span>
              <span className="font-display text-ink block text-base font-semibold tracking-tight">
                {link.label}
              </span>
              <span className="text-ink-muted block text-xs">{BLURB[link.href]}</span>
            </span>
            <ArrowUpRight
              size={16}
              weight="regular"
              aria-hidden
              className="text-ink-muted group-hover:text-accent shrink-0 transition-colors"
            />
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
