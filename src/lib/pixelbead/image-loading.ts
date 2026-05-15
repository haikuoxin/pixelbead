import type { PixelBeadErrorCode } from "./types";

export interface LoadedImage {
  url: string;
  element: HTMLImageElement;
  width: number;
  height: number;
}

export async function loadImageFromFile(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image_load_failed"));
      image.src = url;
    });
    return { url, element: image, width: image.naturalWidth, height: image.naturalHeight };
  } catch {
    URL.revokeObjectURL(url);
    const code: PixelBeadErrorCode = "image_load_failed";
    throw Object.assign(new Error(code), { code });
  }
}
