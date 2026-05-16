"use client";

import { useMemo, useState } from "react";
import type { BeadPattern, GridSize, Language, WorkflowStep } from "../../lib/pixelbead/types";
import { getCopy } from "../../lib/pixelbead/copy";
import { BEAD_BOARD_PRESETS, getColorCount } from "../../lib/pixelbead/presets";
import { UploadStep } from "./UploadStep";
import { CropStep } from "./CropStep";
import { PreviewEditor } from "./PreviewEditor";
import { LanguageToggle } from "./LanguageToggle";

export function PixelBeadApp() {
  const [language, setLanguage] = useState<Language>("zh");
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [grid, setGrid] = useState<GridSize>(BEAD_BOARD_PRESETS[0]);
  const [pattern, setPattern] = useState<BeadPattern | null>(null);
  const copy = useMemo(() => getCopy(language), [language]);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <h1 className="text-2xl font-semibold tracking-normal">{copy.appTitle}</h1>
          <LanguageToggle language={language} onChange={setLanguage} />
        </header>
        {step === "upload" && (
          <UploadStep
            copy={copy}
            language={language}
            onImageLoaded={(loaded) => {
              setImage(loaded.element);
              setImageUrl(loaded.url);
              setStep("crop");
            }}
          />
        )}
        {step === "crop" && image && (
          <CropStep
            copy={copy}
            image={image}
            imageUrl={imageUrl}
            grid={grid}
            onGridChange={setGrid}
            onPatternReady={(nextPattern) => {
              setPattern(nextPattern);
              setStep("preview");
            }}
            defaultColorCount={getColorCount("standard")}
          />
        )}
        {step === "preview" && pattern && (
          <PreviewEditor copy={copy} pattern={pattern} originalUrl={imageUrl} grid={grid} />
        )}
      </div>
    </main>
  );
}
