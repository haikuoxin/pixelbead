import { afterEach, describe, expect, it, vi } from "vitest";
import { createCroppedPreviewUrl } from "./crop-preview";

describe("createCroppedPreviewUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws the natural crop to a canvas and returns an object URL", async () => {
    const drawImage = vi.fn();
    const blob = new Blob(["crop"], { type: "image/png" });
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toBlob: vi.fn((callback: BlobCallback) => callback(blob), "image/png"),
    };
    const createElement = vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:cropped-preview");
    const image = { naturalWidth: 800, naturalHeight: 600 } as HTMLImageElement;

    await expect(createCroppedPreviewUrl(image, { x: 10.5, y: 20.25, width: 300.5, height: 200.75 })).resolves.toBe(
      "blob:cropped-preview",
    );

    expect(createElement).toHaveBeenCalledWith("canvas");
    expect(canvas.width).toBe(301);
    expect(canvas.height).toBe(201);
    expect(drawImage).toHaveBeenCalledWith(image, 10.5, 20.25, 300.5, 200.75, 0, 0, 301, 201);
    expect(createObjectURL).toHaveBeenCalledWith(blob);
  });
});
