import type { PixelBeadErrorCode } from "./types";

export type PixelBeadCodedError = Error & { code: PixelBeadErrorCode };

export function codedError(code: PixelBeadErrorCode, message: string = code): PixelBeadCodedError {
  return Object.assign(new Error(message), { code });
}
