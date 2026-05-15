import { describe, expect, it } from "vitest";
import { getErrorMessage, PIXEL_BEAD_ERROR_CODES } from "./errors";
import type { Language } from "./types";

describe("PixelBead errors", () => {
  it("returns a non-empty message for every error code in each language", () => {
    const languages: Language[] = ["zh", "en"];

    for (const language of languages) {
      for (const code of PIXEL_BEAD_ERROR_CODES) {
        expect(getErrorMessage(language, code).trim()).not.toBe("");
      }
    }
  });
});
