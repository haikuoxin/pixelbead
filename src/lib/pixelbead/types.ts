export type Language = "zh" | "en";

export type ColorMode = "simple" | "standard" | "detailed";

export type ConversionMode = "subject" | "whole";

export type BackgroundTreatment = "empty" | "white" | "lightGray";

export type PatternCellKind = "bead" | "empty" | "background";

export type SubjectWarningCode = "subject_too_small" | "subject_fills_crop" | "subject_detail_low";

export type WorkflowStep = "upload" | "crop" | "preview";

export type PixelBeadErrorCode =
  | "unsupported_format"
  | "file_read_failed"
  | "image_load_failed"
  | "image_too_large"
  | "missing_image"
  | "invalid_crop"
  | "invalid_grid_size"
  | "invalid_color_count"
  | "missing_browser_api"
  | "export_failed";

export interface GridSize {
  width: number;
  height: number;
}

export interface SubjectMask {
  width: number;
  height: number;
  alpha: Uint8ClampedArray;
}

export interface SubjectWarning {
  code: SubjectWarningCode;
}

export interface BeadBoardPreset extends GridSize {
  id: string;
  label: string;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PaletteColor extends RgbColor {
  hex: string;
}

export interface PatternCell {
  x: number;
  y: number;
  kind: PatternCellKind;
  color: PaletteColor;
}

export interface ColorStat {
  color: PaletteColor;
  count: number;
}

export interface BeadPattern {
  width: number;
  height: number;
  cells: PatternCell[];
  stats: ColorStat[];
}
