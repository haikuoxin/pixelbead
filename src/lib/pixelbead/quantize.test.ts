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
});
