import type { BeadPattern, GridSize, RgbColor } from "./types";
import type { PaletteColor } from "./types";
import { codedError } from "./coded-error";
import { nearestPaletteColor } from "./palette";
import { quantizeColors } from "./quantize";

interface PatternOptions {
  palette?: readonly PaletteColor[];
}

function isValidGridSize(grid: GridSize): boolean {
  return Number.isInteger(grid.width) && Number.isInteger(grid.height) && grid.width > 0 && grid.height > 0;
}

function isValidRgbColor(color: RgbColor): boolean {
  return [color.r, color.g, color.b].every((channel) => Number.isFinite(channel) && Number.isInteger(channel) && channel >= 0 && channel <= 255);
}

export function buildPatternFromColors(colors: RgbColor[], grid: GridSize, colorCount: number, options: PatternOptions = {}): BeadPattern {
  if (!isValidGridSize(grid) || colors.length !== grid.width * grid.height) {
    throw codedError("invalid_grid_size");
  }
  if (!Number.isInteger(colorCount) || colorCount <= 0) {
    throw codedError("invalid_color_count");
  }
  if (!colors.every(isValidRgbColor)) {
    throw codedError("invalid_color_count", "invalid_rgb_color");
  }

  const quantized = quantizeColors(colors, colorCount);
  const cells = quantized.slice(0, grid.width * grid.height).map((rgb, index) => {
    const color = nearestPaletteColor(rgb, options.palette);

    return { x: index % grid.width, y: Math.floor(index / grid.width), color };
  });
  const counts = new Map<string, { color: BeadPattern["cells"][number]["color"]; count: number }>();

  for (const cell of cells) {
    const current = counts.get(cell.color.hex) ?? { color: cell.color, count: 0 };
    current.count += 1;
    counts.set(cell.color.hex, current);
  }

  return {
    width: grid.width,
    height: grid.height,
    cells,
    stats: [...counts.values()].sort((a, b) => b.count - a.count),
  };
}
