import { codedError } from "./coded-error";
import type { PixelCrop } from "./crop";
import type { SubjectMask } from "./types";

type RemoveBackground = (input: Blob | HTMLCanvasElement | HTMLImageElement) => Promise<Blob>;

export interface SubjectSegmentationProvider {
  segment(image: HTMLImageElement, crop: PixelCrop): Promise<SubjectMask>;
}

function cropImageToCanvas(image: HTMLImageElement, crop: PixelCrop): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const context = canvas.getContext("2d");
  if (!context) throw codedError("missing_browser_api");
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function blobToMask(blob: Blob): Promise<SubjectMask> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw codedError("missing_browser_api");
  context.drawImage(bitmap, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const alpha = new Uint8ClampedArray(canvas.width * canvas.height);

  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = imageData[index * 4 + 3];
  }

  return { width: canvas.width, height: canvas.height, alpha };
}

export function createSubjectSegmentationProvider(removeBackground: RemoveBackground): SubjectSegmentationProvider {
  return {
    async segment(image, crop) {
      try {
        const cropped = cropImageToCanvas(image, crop);
        const result = await removeBackground(cropped);
        return await blobToMask(result);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) throw error;
        throw codedError("subject_segmentation_failed");
      }
    },
  };
}

export async function createImglySubjectSegmentationProvider(): Promise<SubjectSegmentationProvider> {
  try {
    const module = await import("@imgly/background-removal");
    return createSubjectSegmentationProvider(module.removeBackground);
  } catch {
    throw codedError("subject_model_load_failed");
  }
}
