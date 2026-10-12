/**
 * Characterisation tests for the dependency-free PNG writer.
 *
 * There is no image library in this repo and there will not be one: a PNG is a signature,
 * three chunks and a CRC, and `node:zlib` does the hard part. These tests decode what the
 * writer produced, so a wrong chunk length or a bad CRC fails here rather than in a
 * browser that silently refuses the image.
 */
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildStrip, encodePng, parsePngHeader, renderCell, scaleRgba } from "@/sprites/png";
import { TRAINER } from "@/sprites/trainer";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("encodePng", () => {
  const rgba = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 255, 9, 9, 9, 0]);
  const png = encodePng(2, 2, rgba);

  it("starts with the PNG signature", () => {
    expect(png.subarray(0, 8)).toEqual(SIGNATURE);
  });

  it("ends with an IEND chunk", () => {
    expect(png.subarray(-8, -4).toString("latin1")).toBe("IEND");
  });

  it("records the real dimensions, 8 bits per channel and RGBA", () => {
    expect(parsePngHeader(png)).toEqual({ width: 2, height: 2, bitDepth: 8, colorType: 6 });
  });

  it("stores one filter byte per row and the pixels verbatim", () => {
    const idatLength = png.readUInt32BE(8 + 25);
    const idat = png.subarray(8 + 25 + 8, 8 + 25 + 8 + idatLength);
    const raw = inflateSync(idat);
    expect(raw).toHaveLength((2 * 4 + 1) * 2);
    expect(raw[0]).toBe(0);
    expect(raw[1]).toBe(255);
    expect(raw[2]).toBe(0);
    expect(raw[5]).toBe(0);
    expect(raw[6]).toBe(255);
    expect(raw[7]).toBe(0);
    expect(raw[8]).toBe(128);
    expect(raw[9]).toBe(0);
    expect(raw[10]).toBe(0);
    expect(raw[11]).toBe(0);
    expect(raw[12]).toBe(255);
    expect(raw[13]).toBe(255);
    expect(raw[14]).toBe(9);
    expect(raw[15]).toBe(9);
    expect(raw[16]).toBe(9);
    expect(raw[17]).toBe(0);
  });

  it("returns a buffer", () => {
    expect(Buffer.isBuffer(png)).toBe(true);
  });
});

describe("scaleRgba", () => {
  it("multiplies each pixel by the scale", () => {
    const source = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const scaled = scaleRgba(source, 2, 1, 2);
    expect(scaled.width).toBe(4);
    expect(scaled.height).toBe(2);
    expect([...scaled.rgba.subarray(0, 4)]).toEqual([1, 2, 3, 4]);
    expect([...scaled.rgba.subarray(4, 8)]).toEqual([1, 2, 3, 4]);
    expect([...scaled.rgba.subarray(8, 12)]).toEqual([5, 6, 7, 8]);
    expect([...scaled.rgba.subarray(16, 20)]).toEqual([1, 2, 3, 4]);
    expect([...scaled.rgba.subarray(24, 28)]).toEqual([5, 6, 7, 8]);
  });

  it("refuses a scale below one", () => {
    expect(() => scaleRgba(new Uint8Array(4), 1, 1, 0)).toThrow(/scale/i);
  });
});

describe("renderCell", () => {
  it("renders the cell size at 1x", () => {
    const cell = renderCell(TRAINER, { frame: 0 }, 1);
    expect(cell).toMatchObject({ width: 16, height: 24 });
    expect(cell.rgba).toHaveLength(16 * 24 * 4);
  });

  it("leaves transparent pixels at zero alpha", () => {
    const cell = renderCell(TRAINER, { frame: 0 }, 1);
    const alphaAt = (x: number, y: number) => cell.rgba[(y * 16 + x) * 4 + 3];
    expect(alphaAt(0, 0)).toBe(0);
    expect(alphaAt(7, 6)).toBe(255);
  });

  it("applies the frame offset without leaving the canvas", () => {
    const base = renderCell(TRAINER, { frame: 0 }, 1);
    const shifted = renderCell(TRAINER, { frame: 0, dy: 1 }, 1);
    const opaqueCount = (cell: { rgba: Uint8Array }) =>
      [...cell.rgba].filter((alpha, index) => index % 4 === 3 && alpha === 255).length;
    // The grid's bottom row is empty, so a one-pixel downward shift loses nothing.
    expect(opaqueCount(shifted)).toBe(opaqueCount(base));
    expect(shifted.rgba[(8 * 16 + 7) * 4 + 3]).toBe(255);
  });
});

describe("buildStrip", () => {
  it("is as wide as its frame count times the cell width, at any integer scale", () => {
    const idle = buildStrip(TRAINER, "idle", 1);
    const walk = buildStrip(TRAINER, "walk", 4);
    expect(idle.width).toBe(16 * 2);
    expect(idle.height).toBe(24);
    expect(walk.width).toBe(16 * 4 * 4);
    expect(walk.height).toBe(24 * 4);
    expect(parsePngHeader(walk.png)).toEqual({
      width: 256,
      height: 96,
      bitDepth: 8,
      colorType: 6,
    });
  });
});
