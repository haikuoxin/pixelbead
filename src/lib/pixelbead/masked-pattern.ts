import { codedError } from "./coded-error";
import { hexToRgb, nearestPaletteColor } from "./palette";
import { quantizeColors } from "./quantize";
import type { BackgroundTreatment, BeadPattern, GridSize, PaletteColor, RgbColor } from "./types";

interface MaskedPatternOptions {
  backgroundTreatment: BackgroundTreatment;
  palette?: readonly PaletteColor[];
}

const BACKGROUND_COLORS: Record<Exclude<BackgroundTreatment, "empty">, PaletteColor> = {
  white: { ...hexToRgb("#ffffff"), hex: "#ffffff" },
  lightGray: { ...hexToRgb("#d1d5db"), hex: "#d1d5db" },
};

export function buildMaskedPatternFromColors(
  colors: RgbColor[],
  foreground: boolean[],
  grid: GridSize,
  colorCount: number,
  options: MaskedPatternOptions,
): BeadPattern {
  if (colors.length !== grid.width * grid.height || foreground.length !== colors.length) {
    throw codedError("invalid_grid_size");
  }

  const subjectColors = colors.filter((_, index) => foreground[index]);
  if (subjectColors.length === 0) {
    throw codedError("subject_not_found");
  }

  const quantizedSubjectColors = quantizeColors(subjectColors, colorCount);
  let subjectIndex = 0;

  const cells = colors.map((_, index) => {
    const x = index % grid.width;
    const y = Math.floor(index / grid.width);

    if (!foreground[index]) {
      if (options.backgroundTreatment === "empty") {
        return { x, y, kind: "empty" as const, color: BACKGROUND_COLORS.white };
      }

      return { x, y, kind: "background" as const, color: BACKGROUND_COLORS[options.backgroundTreatment] };
    }

    const color = nearestPaletteColor(quantizedSubjectColors[subjectIndex], options.palette);
    subjectIndex += 1;

    return { x, y, kind: "bead" as const, color };
  });

  const counts = new Map<string, { color: BeadPattern["cells"][number]["color"]; count: number }>();
  for (const cell of cells) {
    if (cell.kind !== "bead") continue;
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
