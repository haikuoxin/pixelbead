import { codedError } from "./coded-error";
import type { GridSize, RgbColor } from "./types";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
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

export function extractGridColors(image: HTMLImageElement, crop: PixelCrop, grid: GridSize): RgbColor[] {
  if (!validateGridSize(grid) || crop.width <= 0 || crop.height <= 0) {
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
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, grid.width, grid.height);

  const data = context.getImageData(0, 0, grid.width, grid.height).data;
  const colors: RgbColor[] = [];
  for (let index = 0; index < data.length; index += 4) {
    colors.push({ r: data[index], g: data[index + 1], b: data[index + 2] });
  }

  return colors;
}
