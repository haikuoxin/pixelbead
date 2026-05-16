import { describe, expect, it } from "vitest";
import { colorDistance, hexToRgb, rgbToHex, nearestPaletteColor, GENERAL_PALETTE } from "./palette";

describe("palette helpers", () => {
  it("converts rgb and hex consistently", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 16 })).toBe("#ff0010");
    expect(hexToRgb("#ff0010")).toEqual({ r: 255, g: 0, b: 16 });
    expect(hexToRgb("ff0010")).toEqual({ r: 255, g: 0, b: 16 });
  });

  it("throws for malformed hex colors", () => {
    expect(() => hexToRgb("#fff")).toThrow();
    expect(() => hexToRgb("#gg0010")).toThrow();
    expect(() => hexToRgb("ff00100")).toThrow();
  });

  it("throws for invalid rgb channels", () => {
    expect(() => rgbToHex({ r: -1, g: 0, b: 0 })).toThrow();
    expect(() => rgbToHex({ r: 0, g: 256, b: 0 })).toThrow();
    expect(() => rgbToHex({ r: 0, g: 0, b: 1.5 })).toThrow();
  });

  it("finds nearest palette color", () => {
    expect(GENERAL_PALETTE.length).toBeGreaterThanOrEqual(36);
    expect(nearestPaletteColor({ r: 250, g: 250, b: 250 }).hex).toBe("#ffffff");
  });

  it("throws when finding a nearest color in an empty palette", () => {
    expect(() => nearestPaletteColor({ r: 250, g: 250, b: 250 }, [])).toThrow();
  });

  it("exposes an immutable general palette", () => {
    expect(Object.isFrozen(GENERAL_PALETTE)).toBe(true);
    expect(Object.isFrozen(GENERAL_PALETTE[0])).toBe(true);
    expect(() => {
      (GENERAL_PALETTE as typeof GENERAL_PALETTE & { push: (color: (typeof GENERAL_PALETTE)[number]) => number }).push(
        GENERAL_PALETTE[0],
      );
    }).toThrow();
  });

  it("calculates squared color distance", () => {
    expect(colorDistance({ r: 10, g: 20, b: 30 }, { r: 13, g: 24, b: 42 })).toBe(169);
  });
});
