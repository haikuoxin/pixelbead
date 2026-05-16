"use client";

import type { Language } from "../../lib/pixelbead/types";
import type { getCopy } from "../../lib/pixelbead/copy";

type PixelBeadCopy = ReturnType<typeof getCopy>;

interface LanguageToggleProps {
  language: Language;
  onChange: (language: Language) => void;
  copy: PixelBeadCopy;
}

export function LanguageToggle({ language, onChange, copy }: LanguageToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-zinc-300 bg-white p-1" aria-label={copy.language.label}>
      {(["zh", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`min-h-9 px-3 text-sm font-medium transition ${
            language === option ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
          }`}
          aria-pressed={language === option}
        >
          {copy.language[option]}
        </button>
      ))}
    </div>
  );
}
