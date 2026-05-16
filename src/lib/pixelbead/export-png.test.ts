import { describe, expect, it } from "vitest";
import { calculateExportSize } from "./export-png";

describe("calculateExportSize", () => {
  it("scales small grids into high-resolution exports", () => {
    expect(calculateExportSize({ width: 29, height: 29 }, false)).toEqual({ width: 1160, height: 1160 });
  });

  it("adds width when color statistics are included", () => {
    expect(calculateExportSize({ width: 29, height: 29 }, true).width).toBeGreaterThan(1160);
  });
});
