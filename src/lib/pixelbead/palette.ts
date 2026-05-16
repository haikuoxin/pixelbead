import type { PaletteColor, RgbColor } from "./types";
import { codedError } from "./coded-error";

export function rgbToHex(color: RgbColor): string {
  for (const value of [color.r, color.g, color.b]) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw codedError("invalid_color_count", "invalid_rgb_color");
    }
  }

  return `#${[color.r, color.g, color.b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb(hex: string): RgbColor {
  if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) {
    throw codedError("invalid_color_count", "invalid_hex_color");
  }

  const normalized = hex.replace("#", "");

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function color(hex: string): PaletteColor {
  return Object.freeze({ ...hexToRgb(hex), hex }) as PaletteColor;
}

export const GENERAL_PALETTE: readonly PaletteColor[] = Object.freeze([
  "#000000",
  "#ffffff",
  "#1f2937",
  "#4b5563",
  "#9ca3af",
  "#d1d5db",
  "#7f1d1d",
  "#dc2626",
  "#f87171",
  "#fb923c",
  "#f97316",
  "#facc15",
  "#713f12",
  "#92400e",
  "#b45309",
  "#f5deb3",
  "#f3c7a6",
  "#d8a47f",
  "#14532d",
  "#16a34a",
  "#86efac",
  "#064e3b",
  "#14b8a6",
  "#99f6e4",
  "#1e3a8a",
  "#2563eb",
  "#93c5fd",
  "#312e81",
  "#7c3aed",
  "#c4b5fd",
  "#831843",
  "#db2777",
  "#f9a8d4",
  "#be123c",
  "#fb7185",
  "#fecdd3",
  "#581c87",
  "#a855f7",
  "#e9d5ff",
  "#365314",
  "#84cc16",
  "#d9f99d",
].map(color));

export function colorDistance(a: RgbColor, b: RgbColor): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

export function nearestPaletteColor(input: RgbColor, palette: readonly PaletteColor[] = GENERAL_PALETTE): PaletteColor {
  if (palette.length === 0) {
    throw codedError("invalid_color_count", "empty_palette");
  }

  return palette.reduce(
    (best, candidate) => (colorDistance(input, candidate) < colorDistance(input, best) ? candidate : best),
    palette[0],
  );
}
