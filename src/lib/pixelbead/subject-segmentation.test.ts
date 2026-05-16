import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSubjectSegmentationProvider } from "./subject-segmentation";

describe("subject segmentation provider", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([0, 0, 0, 255]) })),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("wraps invalid model output as a subject segmentation failure", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => {
        throw new Error("decode failed");
      }),
    );
    const provider = createSubjectSegmentationProvider(async () => new Blob([new Uint8Array([1])], { type: "image/png" }));

    await expect(provider.segment({} as HTMLImageElement, { x: 0, y: 0, width: 1, height: 1 })).rejects.toMatchObject({
      code: "subject_segmentation_failed",
    });
  });

  it("wraps dependency failures as subject segmentation failures", async () => {
    const provider = createSubjectSegmentationProvider(vi.fn().mockRejectedValue(new Error("model failed")));

    await expect(provider.segment({} as HTMLImageElement, { x: 0, y: 0, width: 1, height: 1 })).rejects.toMatchObject({
      code: "subject_segmentation_failed",
    });
  });
});
