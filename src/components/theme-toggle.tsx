"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { resolveTheme, THEME_ATTRIBUTE, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * The toggle reads the attribute the pre-paint script already set, so it never disagrees
 * with the first painted frame. It is a client leaf with no props: nothing above it needs
 * to know the theme.
 *
 * The theme lives in the DOM attribute, which is an external store, so it is read with
 * `useSyncExternalStore` rather than copied into state from an effect. That keeps the
 * server render icon-free (`getServerSnapshot` returns `null`) and lets the first client
 * render after hydration agree with the attribute the script wrote.
 */

function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [THEME_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return resolveTheme(
    document.documentElement.getAttribute(THEME_ATTRIBUTE),
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

function getServerSnapshot(): null {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute(THEME_ATTRIBUTE, next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode and blocked storage: the attribute still applies for this session.
    }
  }

  const label = theme === null ? "Switch theme" : `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="focus-ring text-ink-muted inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:text-ink"
    >
      {/* Rendered only after mount, so the server and client markup cannot disagree. */}
      {theme === null ? null : theme === "dark" ? (
        <Sun size={18} weight="regular" aria-hidden />
      ) : (
        <Moon size={18} weight="regular" aria-hidden />
      )}
    </button>
  );
}
