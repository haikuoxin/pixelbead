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
    conversion: {
      title: "转换模式",
      subject: "主体优先",
      whole: "整图转换",
      subjectHint: "适合人物、动物、车辆、玩具、角色、商品等照片。",
      wholeHint: "适合风景、图标、简单背景或想保留完整画面的图片。",
    },
    background: {
      title: "背景",
      empty: "不铺豆",
      white: "白色",
      lightGray: "浅灰",
    },
    subject: {
      loading: "正在加载本地主体识别模型...",
      processing: "正在本地识别主体，不会上传图片。",
      subject_detail_low: "主体在当前尺寸下细节偏少，建议裁剪更近或使用 87 x 87。",
      subject_too_small: "主体占比偏小，建议重新裁剪。",
      subject_fills_crop: "主体几乎填满裁剪区域，背景抠除可能不明显。",
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
    conversion: {
      title: "Conversion mode",
      subject: "Subject first",
      whole: "Whole image",
      subjectHint: "Best for people, animals, vehicles, toys, characters, and product photos.",
      wholeHint: "Best for landscapes, icons, simple backgrounds, or keeping the full image.",
    },
    background: {
      title: "Background",
      empty: "No background beads",
      white: "White",
      lightGray: "Light gray",
    },
    subject: {
      loading: "Loading the local subject detection model...",
      processing: "Detecting the subject locally. Your image is not uploaded.",
      subject_detail_low: "The subject has limited detail at this size. Crop closer or use 87 x 87.",
      subject_too_small: "The subject is small in this crop. Try cropping closer.",
      subject_fills_crop: "The subject fills almost the whole crop, so background removal may not change much.",
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
