import { describe, expect, it } from "vitest";
import { buildPatternFromColors } from "./pattern";

describe("buildPatternFromColors", () => {
  it("creates cells and counts colors", () => {
    const pattern = buildPatternFromColors(
      [
        { r: 255, g: 0, b: 0 },
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 0, g: 0, b: 255 },
      ],
      { width: 2, height: 2 },
      2,
    );

    expect(pattern.cells).toHaveLength(4);
    expect(pattern.stats.reduce((sum, item) => sum + item.count, 0)).toBe(4);
    expect(pattern.stats).toHaveLength(2);
  });

  it("assigns x and y coordinates in row-major order", () => {
    const pattern = buildPatternFromColors(
      [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 255, g: 255, b: 255 },
      ],
      { width: 2, height: 2 },
      4,
    );

    expect(pattern.cells.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it("maps quantized colors to the nearest palette color", () => {
    const pattern = buildPatternFromColors([{ r: 250, g: 250, b: 250 }], { width: 1, height: 1 }, 1);

    expect(pattern.cells[0].color.hex).toBe("#ffffff");
  });

  it("sorts color stats by descending count", () => {
    const pattern = buildPatternFromColors(
      [
        { r: 255, g: 255, b: 255 },
        { r: 250, g: 250, b: 250 },
        { r: 245, g: 245, b: 245 },
        { r: 255, g: 0, b: 0 },
        { r: 250, g: 0, b: 0 },
      ],
      { width: 5, height: 1 },
      2,
    );

    expect(pattern.stats.map((stat) => stat.count)).toEqual([3, 2]);
  });
});
