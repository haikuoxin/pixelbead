import { describe, expect, it } from "vitest";
import { buildMaskedPatternFromColors } from "./masked-pattern";

describe("buildMaskedPatternFromColors", () => {
  it("excludes background cells from color statistics", () => {
    const pattern = buildMaskedPatternFromColors(
      [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ],
      [true, false],
      { width: 2, height: 1 },
      2,
      { backgroundTreatment: "empty" },
    );

    expect(pattern.cells.map((cell) => cell.kind)).toEqual(["bead", "empty"]);
    expect(pattern.stats).toHaveLength(1);
    expect(pattern.stats[0].count).toBe(1);
  });

  it("uses background cells for deliberate background fill", () => {
    const pattern = buildMaskedPatternFromColors(
      [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ],
      [true, false],
      { width: 2, height: 1 },
      2,
      { backgroundTreatment: "white" },
    );

    expect(pattern.cells[1]).toMatchObject({ kind: "background", color: { hex: "#ffffff" } });
    expect(pattern.stats).toHaveLength(1);
  });
});
