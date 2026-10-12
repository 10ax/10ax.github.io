/**
 * Characterisation tests for the pre-paint theme script and its resolver.
 *
 * The script runs before React and before any stylesheet-dependent layout, so it has to
 * be a fixed string: anything interpolated into it is a value that can only be checked at
 * runtime, on the one code path that must never throw.
 */
import { describe, expect, it } from "vitest";
import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  resolveTheme,
  themeInitScript,
} from "@/lib/theme";

describe("themeInitScript", () => {
  const script = themeInitScript();

  it("is a fixed string with nothing interpolated into it", () => {
    expect(script).not.toContain("${");
    expect(script).not.toContain("undefined");
  });

  it("reads the same storage key and attribute the rest of the app uses", () => {
    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain(`dataset.${THEME_ATTRIBUTE.replace("data-", "")}`);
  });

  it("defaults to dark when storage is unavailable", () => {
    expect(script).toContain("catch");
    expect(script).toContain('"dark"');
  });

  it("is safe to inline as the only statement in a script element", () => {
    expect(script.trimStart().startsWith("(")).toBe(true);
    expect(script.trimEnd().endsWith(")")).toBe(true);
  });
});

describe("resolveTheme", () => {
  it("prefers a stored choice over the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignores a stored value that is not a theme", () => {
    expect(resolveTheme("blue", false)).toBe("light");
    expect(resolveTheme("", true)).toBe("dark");
  });
});
