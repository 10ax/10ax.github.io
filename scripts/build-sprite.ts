import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildStrip } from "../src/sprites/png.ts";
import { REQUIRED_STATES, validateSheet } from "../src/sprites/sheet.ts";
import { TRAINER } from "../src/sprites/trainer.ts";

/**
 * Compile every sprite sheet into the PNG strips the site serves.
 *
 * Run with `pnpm run build:sprite`. Node prints an experimental type-stripping warning on
 * 22.x, which is expected and harmless. The output is committed, so a fresh clone and CI
 * never need this script to build.
 */
const SCALES = [1, 4] as const;
const OUT_DIR = join(process.cwd(), "public", "sprites");

const problems = validateSheet(TRAINER);
if (problems.length > 0) {
  console.error(`Refusing to build ${TRAINER.name}:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const state of REQUIRED_STATES) {
  for (const scale of SCALES) {
    const strip = buildStrip(TRAINER, state, scale);
    const file = join(OUT_DIR, `${TRAINER.name}-${state}@${scale}x.png`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, strip.png);
    console.log(
      `${file} ${strip.width}x${strip.height} ${strip.png.length} bytes`,
    );
  }
}
