import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { extractGridColors } from "./crop";
import type { GridSize } from "./types";

const validGrid: GridSize = { width: 2, height: 2 };
const validCrop = { x: 1, y: 2, width: 4, height: 5 };
let drawImage: ReturnType<typeof vi.fn>;
let getImageData: ReturnType<typeof vi.fn>;
let createElement: ReturnType<typeof vi.spyOn>;

function image(width = 10, height = 12): HTMLImageElement {
  return { naturalWidth: width, naturalHeight: height } as HTMLImageElement;
}

function mockCanvas(data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 8, 9, 10, 255])) {
  drawImage = vi.fn();
  getImageData = vi.fn(() => ({ data }));
  const context = {
    imageSmoothingEnabled: false,
    drawImage,
    getImageData,
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
  };

  createElement = vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
}

describe("extractGridColors", () => {
  beforeEach(() => {
    mockCanvas();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { x: -1, y: 0, width: 4, height: 4 },
    { x: Number.NaN, y: 0, width: 4, height: 4 },
    { x: 0, y: Number.POSITIVE_INFINITY, width: 4, height: 4 },
    { x: 0, y: 0, width: Number.NaN, height: 4 },
    { x: 0, y: 0, width: 4, height: Number.NEGATIVE_INFINITY },
    { x: 7, y: 0, width: 4, height: 4 },
    { x: 0, y: 9, width: 4, height: 4 },
  ])("rejects invalid natural-pixel crop %#", (crop) => {
    expect(() => extractGridColors(image(), crop, validGrid)).toThrow(expect.objectContaining({ code: "invalid_crop" }));
    expect(createElement).not.toHaveBeenCalled();
  });

  it("throws invalid_grid_size when the target grid is invalid", () => {
    expect(() => extractGridColors(image(), validCrop, { width: 0, height: 2 })).toThrow(
      expect.objectContaining({ code: "invalid_grid_size" }),
    );
    expect(createElement).not.toHaveBeenCalled();
  });

  it("returns one color per grid cell and draws with the expected source and target rectangles", () => {
    const colors = extractGridColors(image(), validCrop, validGrid);

    expect(colors).toEqual([
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 8, g: 9, b: 10 },
    ]);
    expect(colors).toHaveLength(validGrid.width * validGrid.height);
    expect(drawImage).toHaveBeenCalledWith(image(), 1, 2, 4, 5, 0, 0, 2, 2);
    expect(getImageData).toHaveBeenCalledWith(0, 0, 2, 2);
  });

  it("wraps drawImage failures as invalid_crop errors", () => {
    drawImage.mockImplementation(() => {
      throw new DOMException("bad source rectangle");
    });

    expect(() => extractGridColors(image(), validCrop, validGrid)).toThrow(expect.objectContaining({ code: "invalid_crop" }));
  });

  it("wraps getImageData failures as invalid_crop errors", () => {
    getImageData.mockImplementation(() => {
      throw new DOMException("tainted canvas");
    });

    expect(() => extractGridColors(image(), validCrop, validGrid)).toThrow(expect.objectContaining({ code: "invalid_crop" }));
  });
});
