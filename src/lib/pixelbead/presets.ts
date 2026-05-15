import type { BeadBoardPreset, ColorMode } from "./types";

export const BEAD_BOARD_PRESETS = [
  { id: "29", label: "29 x 29", width: 29, height: 29 },
  { id: "58", label: "58 x 58", width: 58, height: 58 },
  { id: "87", label: "87 x 87", width: 87, height: 87 },
] as const satisfies readonly BeadBoardPreset[];

export const COLOR_MODE_DEFAULT_COUNTS = {
  simple: 12,
  standard: 24,
  detailed: 36,
} as const satisfies Record<ColorMode, number>;

export const COLOR_MODES = [
  { id: "simple", defaultCount: COLOR_MODE_DEFAULT_COUNTS.simple },
  { id: "standard", defaultCount: COLOR_MODE_DEFAULT_COUNTS.standard },
  { id: "detailed", defaultCount: COLOR_MODE_DEFAULT_COUNTS.detailed },
] as const satisfies readonly { id: ColorMode; defaultCount: number }[];

export function getColorCount(mode: ColorMode): number {
  return COLOR_MODE_DEFAULT_COUNTS[mode];
}
