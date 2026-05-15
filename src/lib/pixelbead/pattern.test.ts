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
});
