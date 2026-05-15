import { describe, expect, it } from "vitest";
import { validateImageFile } from "./file-validation";

function file(name: string, type: string) {
  return new File(["x"], name, { type });
}

describe("validateImageFile", () => {
  it("accepts jpg png and webp", () => {
    expect(validateImageFile(file("photo.jpg", "image/jpeg")).ok).toBe(true);
    expect(validateImageFile(file("photo.jpeg", "image/jpeg")).ok).toBe(true);
    expect(validateImageFile(file("photo.JPG", "image/jpeg")).ok).toBe(true);
    expect(validateImageFile(file("photo.JPEG", "image/jpeg")).ok).toBe(true);
    expect(validateImageFile(file("photo.png", "image/png")).ok).toBe(true);
    expect(validateImageFile(file("photo.webp", "image/webp")).ok).toBe(true);
  });

  it("rejects heic and gif", () => {
    expect(validateImageFile(file("photo.heic", "image/heic"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
    expect(validateImageFile(file("moving.gif", "image/gif"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
  });

  it("rejects files when extension and MIME type do not match", () => {
    expect(validateImageFile(file("photo.png", "image/jpeg"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
    expect(validateImageFile(file("photo.webp", "image/png"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
    expect(validateImageFile(file("photo.jpg", "image/webp"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
    expect(validateImageFile(file("photo.jpeg", "image/png"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
  });

  it("rejects files with missing MIME type or extension", () => {
    expect(validateImageFile(file("photo.jpg", ""))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
    expect(validateImageFile(file("photo", "image/jpeg"))).toEqual({
      ok: false,
      code: "unsupported_format",
    });
  });
});
