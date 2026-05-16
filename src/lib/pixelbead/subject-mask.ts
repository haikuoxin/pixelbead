import type { GridSize, SubjectMask, SubjectWarning } from "./types";

export const SUBJECT_ALPHA_THRESHOLD = 128;

export interface SubjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function classifyMaskCell(alpha: number): boolean {
  return alpha >= SUBJECT_ALPHA_THRESHOLD;
}

export function sampleMaskToGrid(mask: SubjectMask, grid: GridSize): boolean[] {
  const cells: boolean[] = [];

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const startX = Math.floor((x / grid.width) * mask.width);
      const endX = Math.max(startX + 1, Math.floor(((x + 1) / grid.width) * mask.width));
      const startY = Math.floor((y / grid.height) * mask.height);
      const endY = Math.max(startY + 1, Math.floor(((y + 1) / grid.height) * mask.height));
      let foreground = 0;
      let total = 0;

      for (let sourceY = startY; sourceY < Math.min(endY, mask.height); sourceY += 1) {
        for (let sourceX = startX; sourceX < Math.min(endX, mask.width); sourceX += 1) {
          foreground += classifyMaskCell(mask.alpha[sourceY * mask.width + sourceX]) ? 1 : 0;
          total += 1;
        }
      }

      cells.push(total > 0 && foreground / total >= 0.5);
    }
  }

  return cells;
}

export function getSubjectBounds(foreground: boolean[], grid: GridSize): SubjectBounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  foreground.forEach((isForeground, index) => {
    if (!isForeground) return;
    const x = index % grid.width;
    const y = Math.floor(index / grid.width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX)) return null;

  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export function getSubjectWarnings(foreground: boolean[], grid: GridSize): SubjectWarning[] {
  const foregroundCount = foreground.filter(Boolean).length;
  const ratio = foregroundCount / foreground.length;
  const bounds = getSubjectBounds(foreground, grid);
  const warnings: SubjectWarning[] = [];

  if (ratio < 0.08) warnings.push({ code: "subject_too_small" });
  if (ratio > 0.92) warnings.push({ code: "subject_fills_crop" });
  if (bounds && bounds.height < 24) warnings.push({ code: "subject_detail_low" });

  return warnings;
}
