import { describe, expect, it } from "vitest";
import { buildPatternFromColors } from "./pattern";

function captureError(run: () => void): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }
}

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

  it("uses a supplied custom palette", () => {
    const customPalette = [
      { r: 0, g: 0, b: 0, hex: "#000000" },
      { r: 255, g: 0, b: 0, hex: "#ff0000" },
    ] as const;
    const pattern = buildPatternFromColors([{ r: 250, g: 250, b: 250 }], { width: 1, height: 1 }, 1, {
      palette: customPalette,
    });

    expect(pattern.cells[0].color.hex).toBe("#ff0000");
  });

  it("throws a coded error for invalid rgb input", () => {
    for (const color of [
      { r: -1, g: 0, b: 0 },
      { r: 0, g: 256, b: 0 },
      { r: 0, g: 0, b: 1.5 },
      { r: Number.POSITIVE_INFINITY, g: 0, b: 0 },
    ]) {
      const error = captureError(() => buildPatternFromColors([color], { width: 1, height: 1 }, 1));

      expect(error).toMatchObject({ code: "invalid_color_count" });
    }
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

  it("throws a coded error when color input is longer than the grid", () => {
    const error = captureError(() =>
      buildPatternFromColors(
        [
          { r: 255, g: 0, b: 0 },
          { r: 0, g: 255, b: 0 },
          { r: 0, g: 0, b: 255 },
        ],
        { width: 2, height: 1 },
        2,
      ),
    );

    expect(error).toMatchObject({ code: "invalid_grid_size" });
  });

  it("throws a coded error when color input is shorter than the grid", () => {
    const error = captureError(() => buildPatternFromColors([{ r: 255, g: 0, b: 0 }], { width: 2, height: 1 }, 2));

    expect(error).toMatchObject({ code: "invalid_grid_size" });
  });

  it("throws a coded error when grid dimensions are not positive integers", () => {
    for (const grid of [
      { width: 0, height: 1 },
      { width: 1, height: 0 },
      { width: -1, height: 1 },
      { width: 1.5, height: 1 },
    ]) {
      const error = captureError(() => buildPatternFromColors([], grid, 2));

      expect(error).toMatchObject({ code: "invalid_grid_size" });
    }
  });

  it("throws a coded error when color count is not a positive integer", () => {
    for (const colorCount of [0, -1, 1.5]) {
      const error = captureError(() => buildPatternFromColors([{ r: 255, g: 0, b: 0 }], { width: 1, height: 1 }, colorCount));

      expect(error).toMatchObject({ code: "invalid_color_count" });
    }
  });
});
