import type { Language } from "./types";

const copy = {
  zh: {
    appTitle: "PixelBead",
    upload: { title: "上传图片", hint: "支持 JPG、PNG、WebP" },
    crop: { title: "裁剪图片", confirm: "确认裁剪" },
    preview: { title: "预览点阵图", original: "原图", result: "点阵结果", export: "导出 PNG" },
  },
  en: {
    appTitle: "PixelBead",
    upload: { title: "Upload image", hint: "Supports JPG, PNG, and WebP" },
    crop: { title: "Crop image", confirm: "Confirm crop" },
    preview: { title: "Preview pattern", original: "Original", result: "Pattern", export: "Export PNG" },
  },
} as const;

export function getCopy(language: Language) {
  return copy[language];
}
