"use client";

import { useState } from "react";
import type { getCopy } from "../../lib/pixelbead/copy";
import { downloadPatternPng } from "../../lib/pixelbead/export-png";
import type { BeadPattern, GridSize } from "../../lib/pixelbead/types";
import { ColorStats } from "./ColorStats";
import { PatternCanvas } from "./PatternCanvas";

type PixelBeadCopy = ReturnType<typeof getCopy>;

interface PreviewEditorProps {
  copy: PixelBeadCopy;
  pattern: BeadPattern;
  originalUrl: string;
  grid: GridSize;
}

export function PreviewEditor({ copy, pattern, originalUrl, grid }: PreviewEditorProps) {
  const [view, setView] = useState<"result" | "original">("result");
  const [includeStats, setIncludeStats] = useState(true);
  const includeStatsLabel = copy.preview.title === "预览点阵图" ? "色号统计" : "Color counts";

  return (
    <section className="flex flex-1 flex-col gap-5 py-5">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{copy.preview.title}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {grid.width} x {grid.height}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-zinc-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("original")}
              aria-pressed={view === "original"}
              className={`min-h-9 px-3 text-sm font-medium ${
                view === "original" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {copy.preview.original}
            </button>
            <button
              type="button"
              onClick={() => setView("result")}
              aria-pressed={view === "result"}
              className={`min-h-9 px-3 text-sm font-medium ${
                view === "result" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {copy.preview.result}
            </button>
          </div>
          <label className="inline-flex min-h-10 items-center gap-2 border border-zinc-300 bg-white px-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={includeStats}
              onChange={(event) => setIncludeStats(event.target.checked)}
              className="accent-zinc-950"
            />
            {includeStatsLabel}
          </label>
          <button
            type="button"
            onClick={() => downloadPatternPng(pattern, includeStats)}
            className="min-h-10 bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            {copy.preview.export}
          </button>
        </div>
      </div>

      {view === "original" ? (
        <div className="overflow-auto border border-zinc-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={originalUrl} alt="" className="block max-h-[70vh] w-full object-contain" />
        </div>
      ) : (
        <PatternCanvas pattern={pattern} />
      )}

      <ColorStats stats={pattern.stats} />
    </section>
  );
}
