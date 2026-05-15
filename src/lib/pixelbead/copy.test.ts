import { describe, expect, it } from "vitest";
import { getCopy } from "./copy";

describe("copy dictionary", () => {
  it("returns Chinese labels for each workflow section", () => {
    const copy = getCopy("zh");

    expect(copy.upload.title).toContain("上传");
    expect(copy.upload.hint).toBeTruthy();
    expect(copy.crop.title).toContain("裁剪");
    expect(copy.crop.confirm).toBeTruthy();
    expect(copy.preview.title).toContain("预览");
    expect(copy.preview.original).toBeTruthy();
    expect(copy.preview.result).toBeTruthy();
    expect(copy.preview.export).toContain("导出");
  });

  it("returns English labels for each workflow section", () => {
    const copy = getCopy("en");

    expect(copy.upload.title).toContain("Upload");
    expect(copy.upload.hint).toBeTruthy();
    expect(copy.crop.title).toContain("Crop");
    expect(copy.crop.confirm).toBeTruthy();
    expect(copy.preview.title).toContain("Preview");
    expect(copy.preview.original).toBeTruthy();
    expect(copy.preview.result).toBeTruthy();
    expect(copy.preview.export).toContain("Export");
  });
});
