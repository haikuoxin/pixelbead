import { describe, expect, it } from "vitest";
import { getNaturalPixelCrop } from "./crop-coordinate";

describe("getNaturalPixelCrop", () => {
  it("uses the current displayed crop when completed crop is missing", () => {
    expect(
      getNaturalPixelCrop({
        completedCrop: null,
        currentCrop: { unit: "%", x: 10, y: 20, width: 50, height: 25 },
        renderedSize: { width: 400, height: 200 },
        naturalSize: { width: 800, height: 600 },
      }),
    ).toEqual({ x: 80, y: 120, width: 400, height: 150 });
  });
});
