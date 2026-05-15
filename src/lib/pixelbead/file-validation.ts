import type { PixelBeadErrorCode } from "./types";

const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

export type ValidationResult = { ok: true } | { ok: false; code: PixelBeadErrorCode };

export function validateImageFile(file: File): ValidationResult {
  const lowerName = file.name.toLowerCase();
  const hasSupportedExtension = supportedExtensions.some((ext) => lowerName.endsWith(ext));
  if (!supportedTypes.has(file.type) || !hasSupportedExtension) {
    return { ok: false, code: "unsupported_format" };
  }
  return { ok: true };
}
