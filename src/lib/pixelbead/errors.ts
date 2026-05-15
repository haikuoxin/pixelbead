import type { Language, PixelBeadErrorCode } from "./types";

const messages: Record<Language, Record<PixelBeadErrorCode, string>> = {
  zh: {
    unsupported_format: "不支持这种图片格式。请上传 JPG、PNG 或 WebP。",
    file_read_failed: "无法读取这个文件。请重新选择图片。",
    image_load_failed: "图片加载失败。请换一张图片再试。",
    image_too_large: "图片太大，浏览器处理失败。请先压缩图片。",
    missing_image: "请先上传图片。",
    invalid_crop: "裁剪区域无效，请重新调整。",
    invalid_grid_size: "请输入有效的宽高格数。",
    invalid_color_count: "请输入有效的颜色数量。",
    missing_browser_api: "当前浏览器不支持必要的图片处理能力。",
    export_failed: "导出失败，请重试。",
  },
  en: {
    unsupported_format: "This image format is not supported. Please upload JPG, PNG, or WebP.",
    file_read_failed: "The file could not be read. Please choose the image again.",
    image_load_failed: "The image failed to load. Please try another image.",
    image_too_large: "The image is too large for browser processing. Please compress it first.",
    missing_image: "Please upload an image first.",
    invalid_crop: "The crop area is invalid. Please adjust it.",
    invalid_grid_size: "Enter a valid grid width and height.",
    invalid_color_count: "Enter a valid color count.",
    missing_browser_api: "This browser does not support the required image processing APIs.",
    export_failed: "Export failed. Please try again.",
  },
};

export function getErrorMessage(language: Language, code: PixelBeadErrorCode): string {
  return messages[language][code];
}
