"use client";

import { useRef, useState } from "react";
import type { getCopy } from "../../lib/pixelbead/copy";
import { validateImageFile } from "../../lib/pixelbead/file-validation";
import { loadImageFromFile, type LoadedImage } from "../../lib/pixelbead/image-loading";
import type { Language } from "../../lib/pixelbead/types";

type PixelBeadCopy = ReturnType<typeof getCopy>;

interface UploadStepProps {
  copy: PixelBeadCopy;
  language: Language;
  onImageLoaded: (loaded: LoadedImage) => void;
}

export function UploadStep({ copy, language, onImageLoaded }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const strings =
    language === "zh"
      ? {
          choose: "选择图片",
          empty: "从本地选择一张图片开始制作拼豆图案。",
          loading: "正在读取图片...",
          unsupported: "请选择 JPG、PNG 或 WebP 图片。",
          failed: "图片读取失败，请换一张图片重试。",
        }
      : {
          choose: "Choose image",
          empty: "Choose a local image to start making a bead pattern.",
          loading: "Reading image...",
          unsupported: "Choose a JPG, PNG, or WebP image.",
          failed: "Image loading failed. Try another image.",
        };

  async function handleFile(file: File | undefined) {
    setError("");
    if (!file) {
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(strings.unsupported);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setIsLoading(true);
    try {
      const loaded = await loadImageFromFile(file);
      onImageLoaded(loaded);
    } catch {
      setError(strings.failed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-6 py-8">
      <div className="max-w-xl space-y-2">
        <h2 className="text-xl font-semibold">{copy.upload.title}</h2>
        <p className="text-sm leading-6 text-zinc-600">{strings.empty}</p>
      </div>

      <label
        htmlFor="pixelbead-upload"
        className="flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-zinc-300 bg-white px-5 py-8 text-center transition hover:border-zinc-700"
      >
        <span className="text-base font-semibold">{copy.upload.title}</span>
        <span className="text-sm text-zinc-600">{copy.upload.hint}</span>
        <span className="mt-2 inline-flex min-h-10 items-center justify-center bg-zinc-950 px-4 text-sm font-medium text-white">
          {isLoading ? strings.loading : strings.choose}
        </span>
        <input
          ref={inputRef}
          id="pixelbead-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label={copy.upload.title}
          disabled={isLoading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>

      {error && <p className="text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
}
