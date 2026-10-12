/**
 * Characterisation test for the design brief's prose rule: no em-dash (`—`) or en-dash
 * (`–`) in a user-visible source string.
 *
 * The pre-flight audit found two route titles still carrying one ("Music — Francesco
 * Tenace"). The published posts keep theirs deliberately (a content change is the owner's
 * call, recorded in the design doc), but `src/app` and `src/components` must stay clean.
 * This reads them as text, which is the same sweep the audit runs, so a new page cannot
 * quietly reintroduce the character.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/app", "src/components"];

/** Every `.ts`, `.tsx` and `.css` file under `dir`, recursively. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [path] : [];
  });
}

describe("source prose", () => {
  it("uses no em-dash or en-dash in src/app or src/components", () => {
    const offenders = ROOTS.flatMap(sourceFiles).filter((file) =>
      /[—–]/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
