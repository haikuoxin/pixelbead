import { describe, expect, it } from "vitest";
import { hexToRgb, rgbToHex, nearestPaletteColor, GENERAL_PALETTE } from "./palette";

describe("palette helpers", () => {
  it("converts rgb and hex consistently", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 16 })).toBe("#ff0010");
    expect(hexToRgb("#ff0010")).toEqual({ r: 255, g: 0, b: 16 });
  });

  it("finds nearest palette color", () => {
    expect(GENERAL_PALETTE.length).toBeGreaterThanOrEqual(36);
    expect(nearestPaletteColor({ r: 250, g: 250, b: 250 }).hex).toBe("#ffffff");
  });
});
