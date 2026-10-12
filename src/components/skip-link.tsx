/**
 * Visible only on keyboard focus. The target id is `main`, which every route's main
 * element carries, so the link always lands on the content rather than the chrome.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="focus-ring bg-accent text-accent-ink sr-only rounded-full px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
    >
      Skip to content
    </a>
  );
}
