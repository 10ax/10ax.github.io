export type Theme = "dark" | "light";

/** The localStorage key the toggle writes and the pre-paint script reads. */
export const THEME_STORAGE_KEY = "ft-theme";

/** The attribute the pre-paint script sets and the CSS blocks key off. */
export const THEME_ATTRIBUTE = "data-theme";

/** Pick the stored theme when it is valid, otherwise the system preference. */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  if (stored === "dark" || stored === "light") return stored;
  return systemPrefersDark ? "dark" : "light";
}

/**
 * The script that runs before paint.
 *
 * It has to be a fixed string, not a template: it is the one code path that runs before
 * React exists, and a throw here leaves the page in the wrong theme with no recovery.
 * It therefore wraps everything in try/catch and falls back to `dark`, which is the
 * designed surface. `tests/theme.test.ts` pins those properties.
 */
export function themeInitScript(): string {
  return '(function(){document.documentElement.classList.add("js");try{var k="ft-theme";var s=localStorage.getItem(k);var t=(s==="dark"||s==="light")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})()';
}
