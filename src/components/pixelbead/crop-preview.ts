import type { PixelCrop } from "../../lib/pixelbead/crop";

export function createCroppedPreviewUrl(image: HTMLImageElement, crop: PixelCrop): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));

  const context = canvas.getContext("2d");
  if (!context) {
    return Promise.reject(new Error("missing_canvas_context"));
  }

  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("crop_preview_failed"));
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}
