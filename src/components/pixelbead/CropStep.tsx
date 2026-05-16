"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop as ReactPixelCrop } from "react-image-crop";
import type { getCopy } from "../../lib/pixelbead/copy";
import { extractGridColors } from "../../lib/pixelbead/crop";
import { getErrorCode, getErrorMessage } from "../../lib/pixelbead/errors";
import { buildMaskedPatternFromColors } from "../../lib/pixelbead/masked-pattern";
import { buildPatternFromColors } from "../../lib/pixelbead/pattern";
import { BEAD_BOARD_PRESETS } from "../../lib/pixelbead/presets";
import { createImglySubjectSegmentationProvider } from "../../lib/pixelbead/subject-segmentation";
import { getSubjectWarnings, sampleMaskToGrid } from "../../lib/pixelbead/subject-mask";
import type { BackgroundTreatment, BeadPattern, ConversionMode, GridSize, Language, SubjectWarning } from "../../lib/pixelbead/types";
import { getNaturalPixelCrop } from "./crop-coordinate";
import { createCroppedPreviewUrl } from "./crop-preview";

type PixelBeadCopy = ReturnType<typeof getCopy>;

interface CropStepProps {
  copy: PixelBeadCopy;
  image: HTMLImageElement;
  imageUrl: string;
  language: Language;
  grid: GridSize;
  onGridChange: (grid: GridSize) => void;
  onPatternReady: (pattern: BeadPattern, croppedPreviewUrl: string) => void;
  defaultColorCount: number;
  conversionMode: ConversionMode;
  backgroundTreatment: BackgroundTreatment;
  onSubjectWarningsChange: (warnings: SubjectWarning[]) => void;
  onSubjectProcessingChange: (processing: boolean) => void;
  isSubjectProcessing: boolean;
  onConversionModeChange: (mode: ConversionMode) => void;
  onBackgroundTreatmentChange: (treatment: BackgroundTreatment) => void;
}

function clampGridValue(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(200, Math.max(1, Math.round(value)));
}

function createCenteredCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 86,
      },
      aspect,
      width,
      height,
    ),
    width,
    height,
  );
}

export function CropStep({
  copy,
  image,
  imageUrl,
  language,
  grid,
  onGridChange,
  onPatternReady,
  defaultColorCount,
  conversionMode,
  backgroundTreatment,
  onSubjectWarningsChange,
  onSubjectProcessingChange,
  isSubjectProcessing,
  onConversionModeChange,
  onBackgroundTreatmentChange,
}: CropStepProps) {
  const renderedImageRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<ReactPixelCrop | null>(null);
  const [colorCount, setColorCount] = useState(defaultColorCount);
  const [error, setError] = useState("");
  const aspect = useMemo(() => grid.width / grid.height, [grid.height, grid.width]);

  useEffect(() => {
    const rendered = renderedImageRef.current;
    const width = rendered?.width || image.naturalWidth;
    const height = rendered?.height || image.naturalHeight;
    const nextCrop = createCenteredCrop(width, height, aspect);
    setCrop(nextCrop);
    setCompletedCrop(null);
  }, [aspect, image.naturalHeight, image.naturalWidth]);

  function updateGrid(partial: Partial<GridSize>) {
    onGridChange({
      width: clampGridValue(partial.width ?? grid.width),
      height: clampGridValue(partial.height ?? grid.height),
    });
  }

  async function handleConfirm() {
    const rendered = renderedImageRef.current;
    if (!rendered) {
      return;
    }

    const naturalCrop = getNaturalPixelCrop({
      completedCrop,
      currentCrop: crop,
      renderedSize: { width: rendered.width, height: rendered.height },
      naturalSize: { width: image.naturalWidth, height: image.naturalHeight },
    });

    try {
      const colors = extractGridColors(image, naturalCrop, grid);
      const croppedPreviewUrl = await createCroppedPreviewUrl(image, naturalCrop);
      if (conversionMode === "subject") {
        onSubjectProcessingChange(true);
        try {
          const provider = await createImglySubjectSegmentationProvider();
          const mask = await provider.segment(image, naturalCrop);
          const foreground = sampleMaskToGrid(mask, grid);
          const pattern = buildMaskedPatternFromColors(colors, foreground, grid, colorCount, { backgroundTreatment });
          onSubjectWarningsChange(getSubjectWarnings(foreground, grid));
          onPatternReady(pattern, croppedPreviewUrl);
          return;
        } finally {
          onSubjectProcessingChange(false);
        }
      }

      const pattern = buildPatternFromColors(colors, grid, colorCount);
      onSubjectWarningsChange([]);
      onPatternReady(pattern, croppedPreviewUrl);
    } catch (cropError) {
      setError(getErrorMessage(language, getErrorCode(cropError, "invalid_crop")));
    }
  }

  return (
    <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-3">
        <h2 className="text-xl font-semibold">{copy.crop.title}</h2>
        <div className="overflow-hidden border border-zinc-200 bg-white">
          <ReactCrop
            crop={crop}
            aspect={aspect}
            minWidth={24}
            minHeight={24}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={renderedImageRef}
              src={imageUrl}
              alt=""
              className="mx-auto h-auto max-h-[72vh] max-w-full object-contain"
              onLoad={(event) => {
                const target = event.currentTarget;
                setCrop(createCenteredCrop(target.width, target.height, aspect));
              }}
            />
          </ReactCrop>
        </div>
      </div>

      <aside className="space-y-5 border-t border-zinc-200 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-900">{copy.crop.size}</h3>
          <div className="grid grid-cols-3 gap-2">
            {BEAD_BOARD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onGridChange({ width: preset.width, height: preset.height })}
                className={`min-h-10 border px-2 text-sm font-medium ${
                  grid.width === preset.width && grid.height === preset.height
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900">{copy.conversion.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={conversionMode === "subject"}
                onClick={() => onConversionModeChange("subject")}
                className={`min-h-10 border px-2 text-sm font-medium ${
                  conversionMode === "subject"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-700"
                }`}
              >
                {copy.conversion.subject}
              </button>
              <button
                type="button"
                aria-pressed={conversionMode === "whole"}
                onClick={() => onConversionModeChange("whole")}
                className={`min-h-10 border px-2 text-sm font-medium ${
                  conversionMode === "whole"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-700"
                }`}
              >
                {copy.conversion.whole}
              </button>
            </div>
            <p className="text-xs leading-5 text-zinc-600">
              {conversionMode === "subject" ? copy.conversion.subjectHint : copy.conversion.wholeHint}
            </p>
          </div>

          {conversionMode === "subject" && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900">{copy.background.title}</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["empty", "white", "lightGray"] as const).map((treatment) => (
                  <button
                    key={treatment}
                    type="button"
                    aria-pressed={backgroundTreatment === treatment}
                    onClick={() => onBackgroundTreatmentChange(treatment)}
                    className={`min-h-10 border px-2 text-sm font-medium ${
                      backgroundTreatment === treatment
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-700"
                    }`}
                  >
                    {copy.background[treatment]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <details className="space-y-3 border border-zinc-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-900">{copy.crop.advanced}</summary>
          <div className="grid grid-cols-2 gap-2 pt-3">
            <label className="space-y-1 text-sm font-medium text-zinc-700">
              {copy.crop.width}
              <input
                type="number"
                min={1}
                max={200}
                value={grid.width}
                onChange={(event) => updateGrid({ width: Number(event.target.value) })}
                className="min-h-10 w-full border border-zinc-300 bg-white px-3 text-zinc-950"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-zinc-700">
              {copy.crop.height}
              <input
                type="number"
                min={1}
                max={200}
                value={grid.height}
                onChange={(event) => updateGrid({ height: Number(event.target.value) })}
                className="min-h-10 w-full border border-zinc-300 bg-white px-3 text-zinc-950"
              />
            </label>
          </div>
          <label className="block space-y-2 pt-3 text-sm font-medium text-zinc-700">
            {copy.crop.colors}
            <input
              type="range"
              min={4}
              max={48}
              value={colorCount}
              onChange={(event) => setColorCount(Number(event.target.value))}
              className="w-full accent-zinc-950"
            />
            <span className="block text-sm text-zinc-600">{colorCount}</span>
          </label>
        </details>

        {isSubjectProcessing && <p className="text-sm font-medium text-zinc-700">{copy.subject.processing}</p>}
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={isSubjectProcessing}
          className="min-h-11 w-full bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          {copy.crop.confirm}
        </button>
      </aside>
    </section>
  );
}
