import type { Language, PixelBeadErrorCode } from "./types";

const pixelBeadErrorCodeMap = {
  unsupported_format: true,
  file_read_failed: true,
  image_load_failed: true,
  image_too_large: true,
  missing_image: true,
  invalid_crop: true,
  invalid_grid_size: true,
  invalid_color_count: true,
  missing_browser_api: true,
  export_failed: true,
  subject_model_load_failed: true,
  subject_segmentation_failed: true,
  subject_not_found: true,
} as const satisfies Record<PixelBeadErrorCode, true>;

export const PIXEL_BEAD_ERROR_CODES = Object.freeze(Object.keys(pixelBeadErrorCodeMap) as PixelBeadErrorCode[]);

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
    subject_model_load_failed: "主体识别模型加载失败。你可以切换到整图转换。",
    subject_segmentation_failed: "主体识别失败。请重新裁剪，或切换到整图转换。",
    subject_not_found: "没有识别到清晰主体。请裁剪得更近，或切换到整图转换。",
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
    subject_model_load_failed: "The subject detection model failed to load. You can switch to whole-image conversion.",
    subject_segmentation_failed: "Subject detection failed. Adjust the crop or switch to whole-image conversion.",
    subject_not_found: "No clear subject was detected. Crop closer or switch to whole-image conversion.",
  },
};

export function getErrorMessage(language: Language, code: PixelBeadErrorCode): string {
  return messages[language][code];
}

export function getErrorCode(error: unknown, fallback: PixelBeadErrorCode): PixelBeadErrorCode {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    PIXEL_BEAD_ERROR_CODES.includes(error.code as PixelBeadErrorCode)
  ) {
    return error.code as PixelBeadErrorCode;
  }
  return fallback;
}
