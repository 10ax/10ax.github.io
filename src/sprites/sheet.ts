export type Palette = Record<string, string>;
export type Grid = readonly string[];
export type FrameRef = { frame: number; dx?: number; dy?: number };
export type SpriteState = "idle" | "walk" | "interact";

export type SpriteSheet = {
  name: string;
  cell: { width: number; height: number };
  palette: Palette;
  frames: readonly Grid[];
  states: Record<SpriteState, readonly FrameRef[]>;
};

/** The transparent pixel. Every other palette key is an opaque colour. */
export const TRANSPARENT = ".";

/** The rows a sheet must declare, in the order they are drawn. */
export const REQUIRED_STATES: readonly SpriteState[] = ["idle", "walk", "interact"] as const;

/**
 * Every problem with a sheet, as human-readable lines. An empty array means valid.
 *
 * This returns rather than throws so the test can report all the problems in one run
 * instead of one per fix, and so the build script can refuse to write a broken sheet.
 */
export function validateSheet(sheet: SpriteSheet): string[] {
  const problems: string[] = [];
  const { width, height } = sheet.cell;

  if (width <= 0 || height <= 0) problems.push(`cell size must be positive, got ${width}x${height}`);

  const paletteKeys = Object.keys(sheet.palette);
  if (!paletteKeys.includes(TRANSPARENT)) problems.push(`palette must define ${TRANSPARENT}`);
  for (const key of paletteKeys) {
    if (key.length !== 1) problems.push(`palette key ${JSON.stringify(key)} is not a single character`);
  }
  if (paletteKeys.length < 6 || paletteKeys.length > 9) {
    problems.push(`palette has ${paletteKeys.length} entries, expected between 6 and 9`);
  }

  if (sheet.frames.length === 0) problems.push("sheet has no frames");

  sheet.frames.forEach((frame, index) => {
    if (frame.length !== height) {
      problems.push(`frame ${index} has ${frame.length} rows, expected ${height}`);
    }
    frame.forEach((row, y) => {
      if (row.length !== width) {
        problems.push(`frame ${index} row ${y} is ${row.length} characters, expected ${width}`);
      }
      for (const char of row) {
        if (!paletteKeys.includes(char)) {
          problems.push(`frame ${index} row ${y} uses ${JSON.stringify(char)}, which is not in the palette`);
        }
      }
    });
  });

  for (const state of REQUIRED_STATES) {
    const refs = sheet.states[state];
    if (!refs || refs.length === 0) {
      problems.push(`state ${state} is missing or empty`);
      continue;
    }
    for (const ref of refs) {
      if (!Number.isInteger(ref.frame) || ref.frame < 0 || ref.frame >= sheet.frames.length) {
        problems.push(`state ${state} references frame ${ref.frame}, which does not exist`);
      }
      for (const [axis, value] of [["dx", ref.dx], ["dy", ref.dy]] as const) {
        if (value !== undefined && (!Number.isInteger(value) || Math.abs(value) > 2)) {
          problems.push(`state ${state} has an out-of-range ${axis} of ${value}`);
        }
      }
    }
  }

  return problems;
}
