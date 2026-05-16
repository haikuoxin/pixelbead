import type { Crop, PixelCrop as ReactPixelCrop } from "react-image-crop";
import type { PixelCrop } from "../../lib/pixelbead/crop";

interface Size {
  width: number;
  height: number;
}

interface NaturalCropOptions {
  completedCrop: ReactPixelCrop | null;
  currentCrop: Crop | undefined;
  renderedSize: Size;
  naturalSize: Size;
}

function cropToRenderedPixels(crop: Crop | undefined, renderedSize: Size): ReactPixelCrop {
  if (!crop) {
    return {
      unit: "px",
      x: 0,
      y: 0,
      width: renderedSize.width,
      height: renderedSize.height,
    };
  }

  if (crop.unit === "%") {
    return {
      unit: "px",
      x: (crop.x / 100) * renderedSize.width,
      y: (crop.y / 100) * renderedSize.height,
      width: (crop.width / 100) * renderedSize.width,
      height: (crop.height / 100) * renderedSize.height,
    };
  }

  return {
    unit: "px",
    x: crop.x,
    y: crop.y,
    width: crop.width,
    height: crop.height,
  };
}

export function getNaturalPixelCrop({
  completedCrop,
  currentCrop,
  renderedSize,
  naturalSize,
}: NaturalCropOptions): PixelCrop {
  const activeCrop = completedCrop ?? cropToRenderedPixels(currentCrop, renderedSize);
  const scaleX = naturalSize.width / renderedSize.width;
  const scaleY = naturalSize.height / renderedSize.height;

  return {
    x: activeCrop.x * scaleX,
    y: activeCrop.y * scaleY,
    width: activeCrop.width * scaleX,
    height: activeCrop.height * scaleY,
  };
}
