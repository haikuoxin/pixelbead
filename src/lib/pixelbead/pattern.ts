import type { BeadPattern, GridSize, RgbColor } from "./types";
import { nearestPaletteColor } from "./palette";
import { quantizeColors } from "./quantize";

function invalidGridSizeError(): Error & { code: "invalid_grid_size" } {
  return Object.assign(new Error("invalid_grid_size"), { code: "invalid_grid_size" as const });
}

function isValidGridSize(grid: GridSize): boolean {
  return Number.isInteger(grid.width) && Number.isInteger(grid.height) && grid.width > 0 && grid.height > 0;
}

export function buildPatternFromColors(colors: RgbColor[], grid: GridSize, colorCount: number): BeadPattern {
  if (!isValidGridSize(grid) || colors.length !== grid.width * grid.height) {
    throw invalidGridSizeError();
  }

  const quantized = quantizeColors(colors, colorCount);
  const cells = quantized.slice(0, grid.width * grid.height).map((rgb, index) => {
    const color = nearestPaletteColor(rgb);

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
