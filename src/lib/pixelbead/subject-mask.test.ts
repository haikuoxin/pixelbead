import { describe, expect, it } from "vitest";
import { SUBJECT_ALPHA_THRESHOLD, classifyMaskCell, getSubjectBounds, getSubjectWarnings, sampleMaskToGrid } from "./subject-mask";
import type { SubjectMask } from "./types";

function mask(width: number, height: number, alpha: number[]): SubjectMask {
  return { width, height, alpha: Uint8ClampedArray.from(alpha) };
}

describe("subject mask helpers", () => {
  it("classifies alpha values using the subject threshold", () => {
    expect(SUBJECT_ALPHA_THRESHOLD).toBe(128);
    expect(classifyMaskCell(127)).toBe(false);
    expect(classifyMaskCell(128)).toBe(true);
  });

  it("samples a source mask into a bead grid", () => {
    const sampled = sampleMaskToGrid(
      mask(4, 4, [255, 255, 0, 0, 255, 255, 0, 0, 0, 0, 255, 255, 0, 0, 255, 255]),
      { width: 2, height: 2 },
    );

    expect(sampled).toEqual([true, false, false, true]);
  });

  it("computes foreground bounds", () => {
    expect(getSubjectBounds([false, true, false, false, true, false], { width: 3, height: 2 })).toEqual({
      x: 1,
      y: 0,
      width: 1,
      height: 2,
    });
  });

  it("reports small and oversized subjects", () => {
    expect(getSubjectWarnings([true, false, false, false], { width: 2, height: 2 }).map((warning) => warning.code)).toContain(
      "subject_detail_low",
    );
    expect(getSubjectWarnings([true, true, true, true], { width: 2, height: 2 }).map((warning) => warning.code)).toContain(
      "subject_fills_crop",
    );
  });
});
