import type { BeadBoardPreset, ColorMode } from "./types";

export const BEAD_BOARD_PRESETS: BeadBoardPreset[] = [
  { id: "29", label: "29 x 29", width: 29, height: 29 },
  { id: "58", label: "58 x 58", width: 58, height: 58 },
  { id: "87", label: "87 x 87", width: 87, height: 87 },
];

export const COLOR_MODES: Array<{ id: ColorMode; defaultCount: number }> = [
  { id: "simple", defaultCount: 12 },
  { id: "standard", defaultCount: 24 },
  { id: "detailed", defaultCount: 36 },
];

export function getColorCount(mode: ColorMode): number {
  return COLOR_MODES.find((item) => item.id === mode)?.defaultCount ?? 24;
}
