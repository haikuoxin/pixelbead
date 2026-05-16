import type { Language } from "./types";

const copy = {
  zh: {
    appTitle: "PixelBead",
    language: { label: "语言", zh: "中文", en: "English" },
    upload: {
      title: "上传图片",
      hint: "支持 JPG、PNG、WebP",
      choose: "选择图片",
      empty: "从本地选择一张图片开始制作拼豆图案。",
      loading: "正在读取图片...",
    },
    crop: {
      title: "裁剪图片",
      confirm: "确认裁剪",
      size: "尺寸",
      width: "宽",
      height: "高",
      colors: "颜色数量",
      advanced: "高级设置",
    },
    preview: {
      title: "预览点阵图",
      original: "原图",
      result: "点阵结果",
      export: "导出 PNG",
      includeStats: "色号统计",
      originalAlt: "已裁剪原图预览",
      patternPreview: "PixelBead 点阵图预览",
    },
  },
  en: {
    appTitle: "PixelBead",
    language: { label: "Language", zh: "中文", en: "English" },
    upload: {
      title: "Upload image",
      hint: "Supports JPG, PNG, and WebP",
      choose: "Choose image",
      empty: "Choose a local image to start making a bead pattern.",
      loading: "Reading image...",
    },
    crop: {
      title: "Crop image",
      confirm: "Confirm crop",
      size: "Size",
      width: "Width",
      height: "Height",
      colors: "Color count",
      advanced: "Advanced settings",
    },
    preview: {
      title: "Preview pattern",
      original: "Original",
      result: "Pattern",
      export: "Export PNG",
      includeStats: "Color counts",
      originalAlt: "Cropped original preview",
      patternPreview: "PixelBead pattern preview",
    },
  },
} as const;

export function getCopy(language: Language) {
  return copy[language];
}
