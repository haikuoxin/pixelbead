import type { PixelBeadErrorCode } from "./types";

export interface LoadedImage {
  url: string;
  element: HTMLImageElement;
  width: number;
  height: number;
  revoke: () => void;
}

export async function loadImageFromFile(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";

  try {
    await new Promise<void>((resolve, reject) => {
      const clearHandlers = () => {
        image.onload = null;
        image.onerror = null;
      };
      image.onload = () => {
        clearHandlers();
        resolve();
      };
      image.onerror = () => {
        clearHandlers();
        reject(new Error("image_load_failed"));
      };
      image.src = url;
    });
    return {
      url,
      element: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      revoke: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    const code: PixelBeadErrorCode = "image_load_failed";
    throw Object.assign(new Error(code), { code });
  }
}
