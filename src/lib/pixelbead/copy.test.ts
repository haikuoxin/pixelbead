import { describe, expect, it } from "vitest";
import { getCopy } from "./copy";

describe("copy dictionary", () => {
  it("returns Chinese and English labels for upload", () => {
    expect(getCopy("zh").upload.title).toContain("上传");
    expect(getCopy("en").upload.title).toContain("Upload");
  });
});
