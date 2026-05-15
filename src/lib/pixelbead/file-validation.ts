import type { PixelBeadErrorCode } from "./types";

const supportedFileTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export type ValidationResult = { ok: true } | { ok: false; code: PixelBeadErrorCode };

export function validateImageFile(file: File): ValidationResult {
  const lowerName = file.name.toLowerCase();
  const expectedType = [...supportedFileTypes].find(([extension]) =>
    lowerName.endsWith(extension),
  )?.[1];
  if (!expectedType || file.type !== expectedType) {
    return { ok: false, code: "unsupported_format" };
  }
  return { ok: true };
}
