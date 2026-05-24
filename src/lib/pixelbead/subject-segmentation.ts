import { codedError } from "./coded-error";
import type { PixelCrop } from "./crop";
import type { SubjectMask } from "./types";

type RemoveBackground = (input: Blob) => Promise<Blob>;

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

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(codedError("missing_browser_api"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
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
        const croppedBlob = await canvasToPngBlob(cropped);
        const result = await removeBackground(croppedBlob);
        return await blobToMask(result);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) throw error;
        throw codedError("subject_segmentation_failed");
      }
    },
  };
}

export async function createImglySubjectSegmentationProvider(): Promise<SubjectSegmentationProvider> {
  if (process.env.NEXT_PUBLIC_PIXELBEAD_E2E_SUBJECT_MASK === "checker") {
    return {
      async segment(_image, crop) {
        const width = Math.max(1, Math.round(crop.width));
        const height = Math.max(1, Math.round(crop.height));
        const alpha = new Uint8ClampedArray(width * height);

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            alpha[y * width + x] = x < width / 2 ? 255 : 0;
          }
        }

        return { width, height, alpha };
      },
    };
  }

  try {
    const backgroundRemoval = await import("@imgly/background-removal");
    return createSubjectSegmentationProvider(backgroundRemoval.removeBackground);
  } catch {
    throw codedError("subject_model_load_failed");
  }
}
