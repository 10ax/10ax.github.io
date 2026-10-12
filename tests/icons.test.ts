/**
 * Characterisation test for the icon family.
 *
 * The design skill wants one family per project, and the migration is only complete when
 * nothing imports the old one. A leftover import is invisible at review time and obvious
 * to this test.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mts)$/.test(path) ? [path] : [];
  });
}

const files = sourceFiles("src");

describe("icons", () => {
  it("imports no icons from lucide-react", () => {
    const offenders = files.filter((f) => readFileSync(f, "utf8").includes("lucide-react"));
    expect(offenders).toEqual([]);
  });

  it("declares lucide-react in no manifest", () => {
    expect(readFileSync("package.json", "utf8")).not.toContain("lucide-react");
  });

  it("imports client-side icons from the package root only", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("@phosphor-icons/react")) continue;
      const isClient = source.trimStart().startsWith('"use client"');
      const deepImport = source.includes('from "@phosphor-icons/react/dist/ssr"');
      expect(isClient && deepImport, `${file} is a client file importing the ssr build`).toBe(false);
    }
  });
});
