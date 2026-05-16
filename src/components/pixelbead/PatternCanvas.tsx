"use client";

import { useEffect, useRef } from "react";
import { renderPatternToCanvas } from "../../lib/pixelbead/export-png";
import type { BeadPattern } from "../../lib/pixelbead/types";

interface PatternCanvasProps {
  pattern: BeadPattern;
  label?: string;
}

export function PatternCanvas({ pattern, label = "PixelBead pattern preview" }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rendered = renderPatternToCanvas(pattern, false);
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    const context = canvas.getContext("2d");
    context?.drawImage(rendered, 0, 0);
  }, [pattern]);

  return (
    <div className="overflow-auto border border-zinc-200 bg-white">
      <canvas ref={canvasRef} className="block h-auto max-h-[70vh] max-w-full" aria-label={label} />
    </div>
  );
}
