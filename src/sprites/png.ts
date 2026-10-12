import { deflateSync } from "node:zlib";
/*
 * The relative `.ts` specifier is deliberate. `scripts/build-sprite.ts` loads this module
 * under bare Node (`--experimental-strip-types`), which does not resolve tsconfig `paths`,
 * so the `@/` alias used elsewhere in the repo cannot be used here. Node also requires the
 * explicit extension for a relative TypeScript import. Do not "tidy" this back to `@/`.
 */
import { TRANSPARENT, type FrameRef, type SpriteSheet, type SpriteState } from "./sheet.ts";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** One PNG chunk: length, type, payload, CRC over type and payload. */
function chunk(type: string, payload: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length, 0);
  const body = Buffer.concat([Buffer.from(type, "latin1"), payload]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

/** Convert one palette character to RGBA using the sheet's palette. */
function pixelFromChar(sheet: SpriteSheet, char: string): [number, number, number, number] {
  const colour = sheet.palette[char];
  if (colour === undefined) throw new Error(`character ${JSON.stringify(char)} is not in the palette`);
  if (char === TRANSPARENT || colour === "transparent") return [0, 0, 0, 0];
  const hex = colour.replace("#", "");
  if (hex.length !== 6) throw new Error(`palette colour ${colour} is not a 6-digit hex value`);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
    255,
  ];
}

/** Write an 8-bit RGBA PNG. No dependency: `node:zlib` does the compression. */
export function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  if (rgba.length !== width * height * 4) {
    throw new Error(`expected ${width * height * 4} bytes of RGBA, received ${rgba.length}`);
  }
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour with alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace
  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Nearest-neighbour upscale, which is the only correct scale for pixel art. */
export function scaleRgba(
  rgba: Uint8Array,
  width: number,
  height: number,
  scale: number,
): { width: number; height: number; rgba: Uint8Array } {
  if (!Number.isInteger(scale) || scale < 1) {
    throw new Error(`scale must be an integer of at least 1, received ${scale}`);
  }
  if (scale === 1) return { width, height, rgba };
  const outWidth = width * scale;
  const outHeight = height * scale;
  const out = new Uint8Array(outWidth * outHeight * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = (y * width + x) * 4;
      const pixel = rgba.subarray(source, source + 4);
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const target = ((y * scale + sy) * outWidth + (x * scale + sx)) * 4;
          out.set(pixel, target);
        }
      }
    }
  }
  return { width: outWidth, height: outHeight, rgba: out };
}

/** Render one cell of the sheet at its offset, then upscale it. */
export function renderCell(
  sheet: SpriteSheet,
  ref: FrameRef,
  scale: number,
): { width: number; height: number; rgba: Uint8Array } {
  const { width, height } = sheet.cell;
  const frame = sheet.frames[ref.frame];
  if (!frame) throw new Error(`frame ${ref.frame} does not exist`);
  const base = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const row = frame[y] ?? "";
    for (let x = 0; x < width; x += 1) {
      const char = row[x] ?? TRANSPARENT;
      base.set(pixelFromChar(sheet, char), (y * width + x) * 4);
    }
  }
  if (!ref.dx && !ref.dy) return scaleRgba(base, width, height, scale);
  const shifted = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const targetX = x + (ref.dx ?? 0);
      const targetY = y + (ref.dy ?? 0);
      if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) continue;
      const source = (y * width + x) * 4;
      shifted.set(base.subarray(source, source + 4), (targetY * width + targetX) * 4);
    }
  }
  return scaleRgba(shifted, width, height, scale);
}

/** A horizontal strip of every cell in a state, ready for CSS `steps()` animation. */
export function buildStrip(
  sheet: SpriteSheet,
  state: SpriteState,
  scale: number,
): { width: number; height: number; rgba: Uint8Array; png: Buffer } {
  const refs = sheet.states[state];
  if (!refs.length) throw new Error(`state ${state} has no frames`);
  const cells = refs.map((ref) => renderCell(sheet, ref, scale));
  const width = cells.reduce((total, cell) => total + cell.width, 0);
  const height = cells[0].height;
  const rgba = new Uint8Array(width * height * 4);
  let offset = 0;
  for (const cell of cells) {
    if (cell.height !== height) throw new Error(`state ${state} mixes cell heights`);
    for (let y = 0; y < height; y += 1) {
      const rowStart = y * cell.width * 4;
      rgba.set(
        cell.rgba.subarray(rowStart, rowStart + cell.width * 4),
        (y * width + offset) * 4,
      );
    }
    offset += cell.width;
  }
  return { width, height, rgba, png: encodePng(width, height, rgba) };
}

/** Read back the header fields a test or a tool cares about. */
export function parsePngHeader(png: Buffer): {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
} {
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    bitDepth: png[24],
    colorType: png[25],
  };
}
