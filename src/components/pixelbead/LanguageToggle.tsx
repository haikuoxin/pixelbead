"use client";

import type { Language } from "../../lib/pixelbead/types";

interface LanguageToggleProps {
  language: Language;
  onChange: (language: Language) => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-zinc-300 bg-white p-1" aria-label="Language">
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
          {option === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}
