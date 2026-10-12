import { TRANSPARENT, type SpriteSheet } from "@/sprites/sheet";

/**
 * The trainer sprite: eight colours plus transparency, two authored frames, and three
 * animated states derived from them. `walk` and `interact` reuse the frames with small
 * offsets, which is how sprites this size actually animate, and it keeps the art
 * reviewable: two grids to read, not eight.
 *
 * Rows are one character per pixel. The test enforces width and height, so a miscounted
 * row fails a test rather than tearing the sprite.
 */
export const TRAINER: SpriteSheet = {
  name: "trainer",
  cell: { width: 16, height: 24 },
  palette: {
    [TRANSPARENT]: "transparent",
    o: "#0d1120", // outline
    h: "#c8433c", // cap
    H: "#8a2a26", // cap shade
    s: "#f0c39a", // skin
    c: "#3f7f6b", // jacket
    C: "#2e5d4f", // jacket shade
    t: "#2a3244", // trousers
    w: "#f5f5f2", // highlight
  },
  frames: [
    [
      "................",
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...HHhhhhhhHH...",
      "...osssssssso...",
      "...oswwsswwso...",
      "...osssssssso...",
      "....osssssso....",
      "...occcccccco...",
      "...occcccccco...",
      "...soccccccos...",
      "...soccccccos...",
      "...soccccccos...",
      "...socCccccos...",
      "...soCCCCCCos...",
      "....otttttto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "...ottto.ottto..",
      "................",
    ],
    [
      "................",
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "...hhhhhhhhhh...",
      "...HHhhhhhhHH...",
      "...osssssssso...",
      "...osssssssso...",
      "...osssssssso...",
      "....osssssso....",
      "...occcccccco...",
      "...occcccccco...",
      "...soccccccos...",
      "...soccccccos...",
      "...soccccccos...",
      "...socCccccos...",
      "...soCCCCCCos...",
      "....otttttto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "....ott.otto....",
      "...ottto.ottto..",
      "................",
    ],
  ],
  states: {
    idle: [{ frame: 0 }, { frame: 1, dy: 1 }],
    walk: [
      { frame: 0, dx: 0 },
      { frame: 0, dx: 0, dy: 1 },
      { frame: 1, dx: 1 },
      { frame: 1, dx: 1, dy: 1 },
    ],
    interact: [{ frame: 0, dy: -1 }, { frame: 1 }],
  },
};
