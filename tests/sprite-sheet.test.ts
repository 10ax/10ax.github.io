/**
 * Characterisation tests for the sprite grid and the sheet contract.
 *
 * A pixel grid is authored by hand, one character per pixel, so a miscounted row is the
 * mistake that actually happens here. This test is what turns that mistake into a failed
 * test instead of a torn PNG shipped to the hero.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REQUIRED_STATES, TRANSPARENT, validateSheet } from "@/sprites/sheet";
import { TRAINER } from "@/sprites/trainer";

describe("TRAINER sheet", () => {
  it("is valid", () => {
    expect(validateSheet(TRAINER)).toEqual([]);
  });

  it("uses a 16x24 cell", () => {
    expect(TRAINER.cell).toEqual({ width: 16, height: 24 });
  });

  it("every frame has exactly one row per pixel row, each the cell width", () => {
    for (const [i, frame] of TRAINER.frames.entries()) {
      expect(frame).toHaveLength(TRAINER.cell.height);
      for (const row of frame) {
        expect(row, `frame ${i} has a row of the wrong width`).toHaveLength(TRAINER.cell.width);
      }
    }
  });

  it("uses only palette characters", () => {
    const allowed = new Set(Object.keys(TRAINER.palette));
    for (const frame of TRAINER.frames) {
      for (const row of frame) {
        for (const char of row) expect(allowed.has(char)).toBe(true);
      }
    }
  });

  it("has a GBA-sized palette with a transparent entry", () => {
    const keys = Object.keys(TRAINER.palette);
    expect(keys).toContain(TRANSPARENT);
    expect(keys.length).toBeGreaterThanOrEqual(6);
    expect(keys.length).toBeLessThanOrEqual(9);
    for (const key of keys) expect(key).toHaveLength(1);
  });

  it("declares the three states with the documented frame counts", () => {
    expect(Object.keys(TRAINER.states)).toEqual([...REQUIRED_STATES]);
    expect(TRAINER.states.idle).toHaveLength(2);
    expect(TRAINER.states.walk).toHaveLength(4);
    expect(TRAINER.states.interact).toHaveLength(2);
  });

  it("references only frames that exist, and offsets that stay on the canvas", () => {
    for (const state of REQUIRED_STATES) {
      for (const ref of TRAINER.states[state]) {
        expect(ref.frame).toBeGreaterThanOrEqual(0);
        expect(ref.frame).toBeLessThan(TRAINER.frames.length);
        expect(Math.abs(ref.dx ?? 0)).toBeLessThanOrEqual(2);
        expect(Math.abs(ref.dy ?? 0)).toBeLessThanOrEqual(2);
      }
    }
  });

  it("draws something", () => {
    const opaque = TRAINER.frames.flatMap((frame) =>
      frame.flatMap((row) => [...row].filter((c) => c !== TRANSPARENT)),
    );
    expect(opaque.length).toBeGreaterThan(100);
  });
});

describe("validateSheet", () => {
  const broken = {
    ...TRAINER,
    frames: [["!"]] as readonly string[][],
  };

  it("reports the problems instead of throwing", () => {
    const problems = validateSheet(broken);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("\n")).toMatch(/row|palette/i);
  });
});

describe("sprite animation CSS", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("defines one keyframe per state and a reduced-motion escape", () => {
    for (const state of REQUIRED_STATES) {
      expect(css).toContain(`@keyframes sprite-${state}`);
    }
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*sprite-idle/);
  });
});
