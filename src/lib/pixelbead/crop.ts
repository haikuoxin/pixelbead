import { codedError } from "./coded-error";
import type { GridSize, RgbColor } from "./types";

export interface PixelCrop {
  /** Natural-image pixel x coordinate. */
  x: number;
  /** Natural-image pixel y coordinate. */
  y: number;
  /** Natural-image pixel width. */
  width: number;
  /** Natural-image pixel height. */
  height: number;
}

export function validateGridSize(grid: GridSize): boolean {
  return (
    Number.isInteger(grid.width) &&
    Number.isInteger(grid.height) &&
    grid.width > 0 &&
    grid.height > 0 &&
    grid.width <= 200 &&
    grid.height <= 200
  );
}

export function validatePixelCrop(image: HTMLImageElement, crop: PixelCrop): boolean {
  return (
    Number.isFinite(crop.x) &&
    Number.isFinite(crop.y) &&
    Number.isFinite(crop.width) &&
    Number.isFinite(crop.height) &&
    crop.x >= 0 &&
    crop.y >= 0 &&
    crop.width > 0 &&
    crop.height > 0 &&
    crop.x + crop.width <= image.naturalWidth &&
    crop.y + crop.height <= image.naturalHeight
  );
}

/**
 * Extracts one RGB color per output grid cell from a crop expressed in natural-image pixel coordinates.
 */
export function extractGridColors(image: HTMLImageElement, crop: PixelCrop, grid: GridSize): RgbColor[] {
  if (!validateGridSize(grid)) {
    throw codedError("invalid_grid_size");
  }

  if (!validatePixelCrop(image, crop)) {
    throw codedError("invalid_crop");
  }

  const canvas = document.createElement("canvas");
  canvas.width = grid.width;
  canvas.height = grid.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw codedError("missing_browser_api");
  }

  context.imageSmoothingEnabled = true;
  let data: Uint8ClampedArray;
  try {
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, grid.width, grid.height);
    data = context.getImageData(0, 0, grid.width, grid.height).data;
  } catch {
    throw codedError("invalid_crop");
  }

  const colors: RgbColor[] = [];
  for (let index = 0; index < data.length; index += 4) {
    colors.push({ r: data[index], g: data[index + 1], b: data[index + 2] });
  }

  return colors;
}
