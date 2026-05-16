import { describe, expect, it } from "vitest";
import {
  BACKGROUND_TREATMENTS,
  BEAD_BOARD_PRESETS,
  COLOR_MODES,
  DEFAULT_CONVERSION_MODE,
  getColorCount,
  getSubjectColorCount,
} from "./presets";

describe("PixelBead presets", () => {
  it("uses bead-board sizes as default presets", () => {
    expect(BEAD_BOARD_PRESETS).toEqual([
      { id: "29", label: "29 x 29", width: 29, height: 29 },
      { id: "58", label: "58 x 58", width: 58, height: 58 },
      { id: "87", label: "87 x 87", width: 87, height: 87 },
    ]);
  });

  it("orders color modes from simple to detailed", () => {
    expect(getColorCount("simple")).toBeLessThan(getColorCount("standard"));
    expect(getColorCount("standard")).toBeLessThan(getColorCount("detailed"));
    expect(COLOR_MODES.map((mode) => mode.id)).toEqual(["simple", "standard", "detailed"]);
  });

  it("uses subject-first conversion by default", () => {
    expect(DEFAULT_CONVERSION_MODE).toBe("subject");
  });

  it("uses higher subject-first color counts than the original simple mode", () => {
    expect(getSubjectColorCount("standard")).toBe(8);
    expect(getSubjectColorCount("detailed")).toBe(12);
  });

  it("defaults to no background beads", () => {
    expect(BACKGROUND_TREATMENTS[0]).toMatchObject({ id: "empty" });
  });
});
