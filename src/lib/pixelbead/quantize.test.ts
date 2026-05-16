import { describe, expect, it } from "vitest";
import { quantizeColors } from "./quantize";

describe("quantizeColors", () => {
  it("limits unique colors to the requested count", () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 250, g: 10, b: 10 },
      { r: 0, g: 0, b: 255 },
      { r: 10, g: 10, b: 250 },
    ];

    expect(new Set(quantizeColors(colors, 2).map((color) => `${color.r},${color.g},${color.b}`)).size).toBeLessThanOrEqual(2);
  });

  it("returns deterministic output for the same colors", () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 240, g: 20, b: 20 },
      { r: 0, g: 255, b: 0 },
      { r: 20, g: 240, b: 20 },
      { r: 0, g: 0, b: 255 },
      { r: 20, g: 20, b: 240 },
    ];

    const output = quantizeColors(colors, 3);

    expect(output).toEqual(quantizeColors(colors, 3));
    expect(new Set(output.map((color) => `${color.r},${color.g},${color.b}`)).size).toBeLessThanOrEqual(3);
  });

  it("returns no colors for non-positive target counts", () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 0, b: 255 },
    ];

    expect(quantizeColors(colors, 0)).toEqual([]);
    expect(quantizeColors(colors, -1)).toEqual([]);
  });

  it("returns no colors for non-integer or non-finite target counts", () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 0, b: 255 },
    ];

    expect(quantizeColors(colors, 1.5)).toEqual([]);
    expect(quantizeColors(colors, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});
