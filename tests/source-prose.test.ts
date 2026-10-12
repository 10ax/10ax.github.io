/**
 * Characterisation test for the design brief's prose rule: no em-dash (`—`) or en-dash
 * (`–`) in a user-visible source string.
 *
 * The pre-flight audit found two route titles still carrying one ("Music — Francesco
 * Tenace"). The published posts keep theirs deliberately (a content change is the owner's
 * call, recorded in the design doc), but the shipped source must stay clean.
 *
 * Comments are stripped before the check, because the rule is about what a visitor reads,
 * not how the code explains itself: `src/lib/posts.ts` documents with em-dashes in JSDoc
 * and is deliberately left alone. `src/app`, `src/components` and `src/lib` are scanned
 * because that is where user-visible strings live — routes, components, nav labels,
 * metadata and the CV facts.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/app", "src/components", "src/lib"];

/** Every `.ts`, `.tsx` and `.css` file under `dir`, recursively. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [path] : [];
  });
}

/**
 * Drop `/* … *\/` blocks and full-line `//` comments. Only whole-line comments are removed:
 * a `//` inside a string literal stays, so a dash next to it is still caught.
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/[^\n]*/gm, "");
}

describe("source prose", () => {
  it("uses no em-dash or en-dash in a user-visible string", () => {
    const offenders = ROOTS.flatMap(sourceFiles).filter((file) =>
      /[—–]/.test(withoutComments(readFileSync(file, "utf8"))),
    );
    expect(offenders).toEqual([]);
  });
});
