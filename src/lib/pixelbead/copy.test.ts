import { describe, expect, it } from "vitest";
import { getCopy } from "./copy";

describe("copy dictionary", () => {
  it("returns Chinese labels for each workflow section", () => {
    const copy = getCopy("zh");

    expect(copy.upload.title).toContain("上传");
    expect(copy.upload.hint).toBeTruthy();
    expect(copy.upload.choose).toBeTruthy();
    expect(copy.upload.empty).toBeTruthy();
    expect(copy.language.en).toBe("English");
    expect(copy.crop.title).toContain("裁剪");
    expect(copy.crop.confirm).toBeTruthy();
    expect(copy.crop.advanced).toBeTruthy();
    expect(copy.preview.title).toContain("预览");
    expect(copy.preview.original).toBeTruthy();
    expect(copy.preview.result).toBeTruthy();
    expect(copy.preview.export).toContain("导出");
    expect(copy.preview.includeStats).toBeTruthy();
    expect(copy.preview.originalAlt).toBeTruthy();
  });

  it("returns English labels for each workflow section", () => {
    const copy = getCopy("en");

    expect(copy.upload.title).toContain("Upload");
    expect(copy.upload.hint).toBeTruthy();
    expect(copy.upload.choose).toBeTruthy();
    expect(copy.upload.empty).toBeTruthy();
    expect(copy.language.en).toBe("English");
    expect(copy.crop.title).toContain("Crop");
    expect(copy.crop.confirm).toBeTruthy();
    expect(copy.crop.advanced).toBeTruthy();
    expect(copy.preview.title).toContain("Preview");
    expect(copy.preview.original).toBeTruthy();
    expect(copy.preview.result).toBeTruthy();
    expect(copy.preview.export).toContain("Export");
    expect(copy.preview.includeStats).toBeTruthy();
    expect(copy.preview.originalAlt).toBeTruthy();
  });

  it("includes subject-first conversion copy", () => {
    expect(getCopy("zh").conversion.subject).toContain("主体");
    expect(getCopy("en").conversion.subject).toContain("Subject");
  });
});
