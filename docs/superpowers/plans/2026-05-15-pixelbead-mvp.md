# PixelBead MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first release-quality PixelBead web app that converts local JPG, PNG, and WebP images into bead-friendly pixel grids with color counts and high-resolution PNG export.

**Architecture:** Use a Next.js App Router shell with one client-side workflow component for upload, crop, preview, settings, and export. Keep image-processing code in framework-independent TypeScript modules so it can be unit tested without React and later moved to a Web Worker or server API. Keep product copy in a lightweight dictionary for Chinese and English.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Testing Library, Playwright, `react-image-crop`, browser Canvas APIs.

---

## File Structure

- Create `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: Next.js project baseline.
- Create `src/components/pixelbead/PixelBeadApp.tsx`: top-level client workflow and screen transitions.
- Create `src/components/pixelbead/UploadStep.tsx`: local upload UI and format errors.
- Create `src/components/pixelbead/CropStep.tsx`: manual crop UI using `react-image-crop`.
- Create `src/components/pixelbead/PreviewEditor.tsx`: original/result toggle, settings, statistics, export controls.
- Create `src/components/pixelbead/PatternCanvas.tsx`: canvas preview for converted grid.
- Create `src/components/pixelbead/ColorStats.tsx`: swatch, HEX, and bead-count table.
- Create `src/components/pixelbead/LanguageToggle.tsx`: Chinese/English switch.
- Create `src/lib/pixelbead/types.ts`: shared domain types.
- Create `src/lib/pixelbead/copy.ts`: lightweight bilingual text dictionary.
- Create `src/lib/pixelbead/presets.ts`: bead-board presets and color mode defaults.
- Create `src/lib/pixelbead/file-validation.ts`: MIME and extension validation.
- Create `src/lib/pixelbead/image-loading.ts`: browser image loading helpers.
- Create `src/lib/pixelbead/crop.ts`: crop math and canvas extraction helpers.
- Create `src/lib/pixelbead/palette.ts`: generic palette, HEX/RGB helpers, nearest-color matching.
- Create `src/lib/pixelbead/quantize.ts`: deterministic color reduction.
- Create `src/lib/pixelbead/pattern.ts`: grid conversion and color counting.
- Create `src/lib/pixelbead/export-png.ts`: high-resolution PNG rendering.
- Create `src/lib/pixelbead/errors.ts`: user-facing error codes and messages.
- Create `src/lib/pixelbead/*.test.ts`: unit tests for domain logic.
- Create `tests/pixelbead.spec.ts`: Playwright smoke test for the complete flow.

## Task 1: Initialize Next.js Project and Test Tooling

**Files:**
- Create: `package.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `vitest.config.ts`
- Create: `tests/pixelbead.spec.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Scaffold the app**

Run:

```bash
npx create-next-app@latest . --yes --force --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm
```

Expected: Next.js files are created in the current repository without deleting `README.md`, `.gitignore`, or `docs/`.

- [ ] **Step 2: Install implementation and test dependencies**

Run:

```bash
npm install react-image-crop
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

Expected: `package.json` contains `react-image-crop`, Vitest, Testing Library, and Playwright dependencies.

- [ ] **Step 3: Add scripts**

Modify `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

Expected: existing generated scripts remain semantically equivalent and include the four test/build commands above.

- [ ] **Step 4: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
```

- [ ] **Step 5: Add initial Playwright smoke test**

Create `tests/pixelbead.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("loads the PixelBead entry screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /PixelBead/i })).toBeVisible();
  await expect(page.getByLabel(/upload image|上传图片/i)).toBeVisible();
});
```

- [ ] **Step 6: Run baseline checks**

Run:

```bash
npm run test
npm run build
```

Expected: `npm run test` passes because `passWithNoTests` is enabled for the scaffold stage; `npm run build` succeeds.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs src tests vitest.config.ts .gitignore
git commit -m "chore: scaffold PixelBead web app"
```

## Task 2: Add Domain Types, Presets, Copy, and Error Messages

**Files:**
- Create: `src/lib/pixelbead/types.ts`
- Create: `src/lib/pixelbead/presets.ts`
- Create: `src/lib/pixelbead/copy.ts`
- Create: `src/lib/pixelbead/errors.ts`
- Test: `src/lib/pixelbead/presets.test.ts`
- Test: `src/lib/pixelbead/copy.test.ts`

- [ ] **Step 1: Write preset tests**

Create `src/lib/pixelbead/presets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BEAD_BOARD_PRESETS, COLOR_MODES, getColorCount } from "./presets";

describe("PixelBead presets", () => {
  it("uses bead-board sizes as default presets", () => {
    expect(BEAD_BOARD_PRESETS.map((preset) => preset.label)).toEqual(["29 x 29", "58 x 58", "87 x 87"]);
  });

  it("orders color modes from simple to detailed", () => {
    expect(getColorCount("simple")).toBeLessThan(getColorCount("standard"));
    expect(getColorCount("standard")).toBeLessThan(getColorCount("detailed"));
    expect(COLOR_MODES.map((mode) => mode.id)).toEqual(["simple", "standard", "detailed"]);
  });
});
```

- [ ] **Step 2: Write copy tests**

Create `src/lib/pixelbead/copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getCopy } from "./copy";

describe("copy dictionary", () => {
  it("returns Chinese and English labels for upload", () => {
    expect(getCopy("zh").upload.title).toContain("上传");
    expect(getCopy("en").upload.title).toContain("Upload");
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/presets.test.ts src/lib/pixelbead/copy.test.ts
```

Expected: tests fail because `presets.ts` and `copy.ts` do not exist.

- [ ] **Step 4: Add shared types**

Create `src/lib/pixelbead/types.ts`:

```ts
export type Language = "zh" | "en";

export type ColorMode = "simple" | "standard" | "detailed";

export type WorkflowStep = "upload" | "crop" | "preview";

export type PixelBeadErrorCode =
  | "unsupported_format"
  | "file_read_failed"
  | "image_load_failed"
  | "image_too_large"
  | "missing_image"
  | "invalid_crop"
  | "invalid_grid_size"
  | "invalid_color_count"
  | "missing_browser_api"
  | "export_failed";

export interface GridSize {
  width: number;
  height: number;
}

export interface BeadBoardPreset extends GridSize {
  id: string;
  label: string;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PaletteColor extends RgbColor {
  hex: string;
}

export interface PatternCell {
  x: number;
  y: number;
  color: PaletteColor;
}

export interface ColorStat {
  color: PaletteColor;
  count: number;
}

export interface BeadPattern {
  width: number;
  height: number;
  cells: PatternCell[];
  stats: ColorStat[];
}
```

- [ ] **Step 5: Add presets**

Create `src/lib/pixelbead/presets.ts`:

```ts
import type { BeadBoardPreset, ColorMode } from "./types";

export const BEAD_BOARD_PRESETS: BeadBoardPreset[] = [
  { id: "29", label: "29 x 29", width: 29, height: 29 },
  { id: "58", label: "58 x 58", width: 58, height: 58 },
  { id: "87", label: "87 x 87", width: 87, height: 87 },
];

export const COLOR_MODES: Array<{ id: ColorMode; defaultCount: number }> = [
  { id: "simple", defaultCount: 12 },
  { id: "standard", defaultCount: 24 },
  { id: "detailed", defaultCount: 36 },
];

export function getColorCount(mode: ColorMode): number {
  return COLOR_MODES.find((item) => item.id === mode)?.defaultCount ?? 24;
}
```

- [ ] **Step 6: Add bilingual copy and errors**

Create `src/lib/pixelbead/copy.ts`:

```ts
import type { Language } from "./types";

const copy = {
  zh: {
    appTitle: "PixelBead",
    upload: { title: "上传图片", hint: "支持 JPG、PNG、WebP" },
    crop: { title: "裁剪图片", confirm: "确认裁剪" },
    preview: { title: "预览点阵图", original: "原图", result: "点阵结果", export: "导出 PNG" },
  },
  en: {
    appTitle: "PixelBead",
    upload: { title: "Upload image", hint: "Supports JPG, PNG, and WebP" },
    crop: { title: "Crop image", confirm: "Confirm crop" },
    preview: { title: "Preview pattern", original: "Original", result: "Pattern", export: "Export PNG" },
  },
} as const;

export function getCopy(language: Language) {
  return copy[language];
}
```

Create `src/lib/pixelbead/errors.ts`:

```ts
import type { Language, PixelBeadErrorCode } from "./types";

const messages: Record<Language, Record<PixelBeadErrorCode, string>> = {
  zh: {
    unsupported_format: "不支持这种图片格式。请上传 JPG、PNG 或 WebP。",
    file_read_failed: "无法读取这个文件。请重新选择图片。",
    image_load_failed: "图片加载失败。请换一张图片再试。",
    image_too_large: "图片太大，浏览器处理失败。请先压缩图片。",
    missing_image: "请先上传图片。",
    invalid_crop: "裁剪区域无效，请重新调整。",
    invalid_grid_size: "请输入有效的宽高格数。",
    invalid_color_count: "请输入有效的颜色数量。",
    missing_browser_api: "当前浏览器不支持必要的图片处理能力。",
    export_failed: "导出失败，请重试。",
  },
  en: {
    unsupported_format: "This image format is not supported. Please upload JPG, PNG, or WebP.",
    file_read_failed: "The file could not be read. Please choose the image again.",
    image_load_failed: "The image failed to load. Please try another image.",
    image_too_large: "The image is too large for browser processing. Please compress it first.",
    missing_image: "Please upload an image first.",
    invalid_crop: "The crop area is invalid. Please adjust it.",
    invalid_grid_size: "Enter a valid grid width and height.",
    invalid_color_count: "Enter a valid color count.",
    missing_browser_api: "This browser does not support the required image processing APIs.",
    export_failed: "Export failed. Please try again.",
  },
};

export function getErrorMessage(language: Language, code: PixelBeadErrorCode): string {
  return messages[language][code];
}
```

- [ ] **Step 7: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/presets.test.ts src/lib/pixelbead/copy.test.ts
git add src/lib/pixelbead
git commit -m "feat: add PixelBead domain presets and copy"
```

Expected: tests pass and the commit is created.

## Task 3: Implement File Validation and Image Loading

**Files:**
- Create: `src/lib/pixelbead/file-validation.ts`
- Create: `src/lib/pixelbead/image-loading.ts`
- Test: `src/lib/pixelbead/file-validation.test.ts`

- [ ] **Step 1: Write file validation tests**

Create `src/lib/pixelbead/file-validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateImageFile } from "./file-validation";

function file(name: string, type: string) {
  return new File(["x"], name, { type });
}

describe("validateImageFile", () => {
  it("accepts jpg png and webp", () => {
    expect(validateImageFile(file("photo.jpg", "image/jpeg")).ok).toBe(true);
    expect(validateImageFile(file("photo.png", "image/png")).ok).toBe(true);
    expect(validateImageFile(file("photo.webp", "image/webp")).ok).toBe(true);
  });

  it("rejects heic and gif", () => {
    expect(validateImageFile(file("photo.heic", "image/heic"))).toEqual({ ok: false, code: "unsupported_format" });
    expect(validateImageFile(file("moving.gif", "image/gif"))).toEqual({ ok: false, code: "unsupported_format" });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/file-validation.test.ts
```

Expected: failure because `file-validation.ts` does not exist.

- [ ] **Step 3: Add file validation**

Create `src/lib/pixelbead/file-validation.ts`:

```ts
import type { PixelBeadErrorCode } from "./types";

const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

export type ValidationResult = { ok: true } | { ok: false; code: PixelBeadErrorCode };

export function validateImageFile(file: File): ValidationResult {
  const lowerName = file.name.toLowerCase();
  const hasSupportedExtension = supportedExtensions.some((ext) => lowerName.endsWith(ext));
  if (!supportedTypes.has(file.type) || !hasSupportedExtension) {
    return { ok: false, code: "unsupported_format" };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Add browser image loading**

Create `src/lib/pixelbead/image-loading.ts`:

```ts
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
  } catch (error) {
    URL.revokeObjectURL(url);
    const code: PixelBeadErrorCode = "image_load_failed";
    throw Object.assign(new Error(code), { code });
  }
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/file-validation.test.ts
git add src/lib/pixelbead/file-validation.ts src/lib/pixelbead/image-loading.ts src/lib/pixelbead/file-validation.test.ts
git commit -m "feat: validate and load local images"
```

Expected: file validation tests pass and image loading helper is committed.

## Task 4: Implement Palette, Quantization, and Pattern Conversion

**Files:**
- Create: `src/lib/pixelbead/palette.ts`
- Create: `src/lib/pixelbead/quantize.ts`
- Create: `src/lib/pixelbead/pattern.ts`
- Test: `src/lib/pixelbead/palette.test.ts`
- Test: `src/lib/pixelbead/quantize.test.ts`
- Test: `src/lib/pixelbead/pattern.test.ts`

- [ ] **Step 1: Write palette tests**

Create `src/lib/pixelbead/palette.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hexToRgb, rgbToHex, nearestPaletteColor, GENERAL_PALETTE } from "./palette";

describe("palette helpers", () => {
  it("converts rgb and hex consistently", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 16 })).toBe("#ff0010");
    expect(hexToRgb("#ff0010")).toEqual({ r: 255, g: 0, b: 16 });
  });

  it("finds nearest palette color", () => {
    expect(GENERAL_PALETTE.length).toBeGreaterThanOrEqual(36);
    expect(nearestPaletteColor({ r: 250, g: 250, b: 250 }).hex).toBe("#ffffff");
  });
});
```

- [ ] **Step 2: Write quantization and pattern tests**

Create `src/lib/pixelbead/quantize.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { quantizeColors } from "./quantize";

describe("quantizeColors", () => {
  it("limits unique colors to the requested count", () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 250, g: 10, b: 10 },
      { r: 0, g: 0, b: 255 },
      { r: 10, g: 10, b: 250 },
    ];
    expect(new Set(quantizeColors(colors, 2).map((color) => `${color.r},${color.g},${color.b}`)).size).toBeLessThanOrEqual(2);
  });
});
```

Create `src/lib/pixelbead/pattern.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildPatternFromColors } from "./pattern";

describe("buildPatternFromColors", () => {
  it("creates cells and counts colors", () => {
    const pattern = buildPatternFromColors(
      [
        { r: 255, g: 0, b: 0 },
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 0, g: 0, b: 255 },
      ],
      { width: 2, height: 2 },
      2,
    );
    expect(pattern.cells).toHaveLength(4);
    expect(pattern.stats.reduce((sum, item) => sum + item.count, 0)).toBe(4);
    expect(pattern.stats).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/palette.test.ts src/lib/pixelbead/quantize.test.ts src/lib/pixelbead/pattern.test.ts
```

Expected: tests fail because the modules do not exist.

- [ ] **Step 4: Implement palette helpers**

Create `src/lib/pixelbead/palette.ts` with a generic palette containing black, white, grays, primary colors, skin tones, browns, greens, blues, purples, and pinks:

```ts
import type { PaletteColor, RgbColor } from "./types";

export function rgbToHex(color: RgbColor): string {
  return `#${[color.r, color.g, color.b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb(hex: string): RgbColor {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function color(hex: string): PaletteColor {
  return { ...hexToRgb(hex), hex };
}

export const GENERAL_PALETTE: PaletteColor[] = [
  "#000000", "#ffffff", "#1f2937", "#4b5563", "#9ca3af", "#d1d5db",
  "#7f1d1d", "#dc2626", "#f87171", "#fb923c", "#f97316", "#facc15",
  "#713f12", "#92400e", "#b45309", "#f5deb3", "#f3c7a6", "#d8a47f",
  "#14532d", "#16a34a", "#86efac", "#064e3b", "#14b8a6", "#99f6e4",
  "#1e3a8a", "#2563eb", "#93c5fd", "#312e81", "#7c3aed", "#c4b5fd",
  "#831843", "#db2777", "#f9a8d4", "#be123c", "#fb7185", "#fecdd3",
  "#581c87", "#a855f7", "#e9d5ff", "#365314", "#84cc16", "#d9f99d",
].map(color);

export function colorDistance(a: RgbColor, b: RgbColor): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

export function nearestPaletteColor(input: RgbColor, palette = GENERAL_PALETTE): PaletteColor {
  return palette.reduce((best, candidate) => (colorDistance(input, candidate) < colorDistance(input, best) ? candidate : best), palette[0]);
}
```

- [ ] **Step 5: Implement deterministic quantization**

Create `src/lib/pixelbead/quantize.ts`:

```ts
import type { RgbColor } from "./types";

function average(colors: RgbColor[]): RgbColor {
  const total = colors.reduce(
    (sum, color) => ({ r: sum.r + color.r, g: sum.g + color.g, b: sum.b + color.b }),
    { r: 0, g: 0, b: 0 },
  );
  return {
    r: Math.round(total.r / colors.length),
    g: Math.round(total.g / colors.length),
    b: Math.round(total.b / colors.length),
  };
}

function widestChannel(colors: RgbColor[]): keyof RgbColor {
  const ranges = {
    r: Math.max(...colors.map((color) => color.r)) - Math.min(...colors.map((color) => color.r)),
    g: Math.max(...colors.map((color) => color.g)) - Math.min(...colors.map((color) => color.g)),
    b: Math.max(...colors.map((color) => color.b)) - Math.min(...colors.map((color) => color.b)),
  };
  return Object.entries(ranges).sort((a, b) => b[1] - a[1])[0][0] as keyof RgbColor;
}

export function quantizeColors(colors: RgbColor[], targetCount: number): RgbColor[] {
  if (colors.length === 0) return [];
  const bucketCount = Math.max(1, Math.min(targetCount, colors.length));
  let buckets: RgbColor[][] = [colors];

  while (buckets.length < bucketCount) {
    buckets = buckets.sort((a, b) => b.length - a.length);
    const bucket = buckets.shift();
    if (!bucket || bucket.length <= 1) {
      if (bucket) buckets.push(bucket);
      break;
    }
    const channel = widestChannel(bucket);
    const sorted = [...bucket].sort((a, b) => a[channel] - b[channel]);
    const midpoint = Math.ceil(sorted.length / 2);
    buckets.push(sorted.slice(0, midpoint), sorted.slice(midpoint));
  }

  const palette = buckets.map(average);
  return colors.map((input) =>
    palette.reduce((best, candidate) => {
      const bestDistance = (input.r - best.r) ** 2 + (input.g - best.g) ** 2 + (input.b - best.b) ** 2;
      const candidateDistance = (input.r - candidate.r) ** 2 + (input.g - candidate.g) ** 2 + (input.b - candidate.b) ** 2;
      return candidateDistance < bestDistance ? candidate : best;
    }, palette[0]),
  );
}
```

- [ ] **Step 6: Implement pattern assembly**

Create `src/lib/pixelbead/pattern.ts`:

```ts
import type { BeadPattern, GridSize, RgbColor } from "./types";
import { nearestPaletteColor } from "./palette";
import { quantizeColors } from "./quantize";

export function buildPatternFromColors(colors: RgbColor[], grid: GridSize, colorCount: number): BeadPattern {
  const quantized = quantizeColors(colors, colorCount);
  const cells = quantized.slice(0, grid.width * grid.height).map((rgb, index) => {
    const color = nearestPaletteColor(rgb);
    return { x: index % grid.width, y: Math.floor(index / grid.width), color };
  });
  const counts = new Map<string, { color: BeadPattern["cells"][number]["color"]; count: number }>();
  for (const cell of cells) {
    const current = counts.get(cell.color.hex) ?? { color: cell.color, count: 0 };
    current.count += 1;
    counts.set(cell.color.hex, current);
  }
  return {
    width: grid.width,
    height: grid.height,
    cells,
    stats: [...counts.values()].sort((a, b) => b.count - a.count),
  };
}
```

- [ ] **Step 7: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/palette.test.ts src/lib/pixelbead/quantize.test.ts src/lib/pixelbead/pattern.test.ts
git add src/lib/pixelbead
git commit -m "feat: convert colors into bead patterns"
```

Expected: palette, quantization, and pattern tests pass.

## Task 5: Implement Crop Extraction and PNG Export

**Files:**
- Create: `src/lib/pixelbead/crop.ts`
- Create: `src/lib/pixelbead/export-png.ts`
- Test: `src/lib/pixelbead/export-png.test.ts`

- [ ] **Step 1: Write export rendering tests**

Create `src/lib/pixelbead/export-png.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateExportSize } from "./export-png";

describe("calculateExportSize", () => {
  it("scales small grids into high-resolution exports", () => {
    expect(calculateExportSize({ width: 29, height: 29 }, false)).toEqual({ width: 1160, height: 1160 });
  });

  it("adds width when color statistics are included", () => {
    expect(calculateExportSize({ width: 29, height: 29 }, true).width).toBeGreaterThan(1160);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/export-png.test.ts
```

Expected: failure because `export-png.ts` does not exist.

- [ ] **Step 3: Implement crop extraction**

Create `src/lib/pixelbead/crop.ts`:

```ts
import type { GridSize, RgbColor } from "./types";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function validateGridSize(grid: GridSize): boolean {
  return Number.isInteger(grid.width) && Number.isInteger(grid.height) && grid.width > 0 && grid.height > 0 && grid.width <= 200 && grid.height <= 200;
}

export function extractGridColors(image: HTMLImageElement, crop: PixelCrop, grid: GridSize): RgbColor[] {
  if (!validateGridSize(grid) || crop.width <= 0 || crop.height <= 0) {
    throw Object.assign(new Error("invalid_crop"), { code: "invalid_crop" });
  }
  const canvas = document.createElement("canvas");
  canvas.width = grid.width;
  canvas.height = grid.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw Object.assign(new Error("missing_browser_api"), { code: "missing_browser_api" });
  context.imageSmoothingEnabled = true;
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, grid.width, grid.height);
  const data = context.getImageData(0, 0, grid.width, grid.height).data;
  const colors: RgbColor[] = [];
  for (let index = 0; index < data.length; index += 4) {
    colors.push({ r: data[index], g: data[index + 1], b: data[index + 2] });
  }
  return colors;
}
```

- [ ] **Step 4: Implement PNG export**

Create `src/lib/pixelbead/export-png.ts`:

```ts
import type { BeadPattern, ColorStat, GridSize } from "./types";

const cellSize = 40;
const statsWidth = 360;

export function calculateExportSize(grid: GridSize, includeStats: boolean) {
  return {
    width: grid.width * cellSize + (includeStats ? statsWidth : 0),
    height: Math.max(grid.height * cellSize, includeStats ? 120 + grid.height * 8 : 0),
  };
}

function drawStats(context: CanvasRenderingContext2D, stats: ColorStat[], startX: number) {
  context.fillStyle = "#ffffff";
  context.fillRect(startX, 0, statsWidth, context.canvas.height);
  context.fillStyle = "#111827";
  context.font = "20px sans-serif";
  context.fillText("Color counts", startX + 24, 40);
  stats.forEach((stat, index) => {
    const y = 76 + index * 30;
    context.fillStyle = stat.color.hex;
    context.fillRect(startX + 24, y - 16, 18, 18);
    context.strokeStyle = "#111827";
    context.strokeRect(startX + 24, y - 16, 18, 18);
    context.fillStyle = "#111827";
    context.fillText(`${stat.color.hex}  ${stat.count}`, startX + 56, y);
  });
}

export function renderPatternToCanvas(pattern: BeadPattern, includeStats: boolean): HTMLCanvasElement {
  const size = calculateExportSize(pattern, includeStats);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw Object.assign(new Error("export_failed"), { code: "export_failed" });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const cell of pattern.cells) {
    context.fillStyle = cell.color.hex;
    context.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
  }
  context.strokeStyle = "rgba(17, 24, 39, 0.45)";
  context.lineWidth = 1;
  for (let x = 0; x <= pattern.width; x += 1) {
    context.beginPath();
    context.moveTo(x * cellSize + 0.5, 0);
    context.lineTo(x * cellSize + 0.5, pattern.height * cellSize);
    context.stroke();
  }
  for (let y = 0; y <= pattern.height; y += 1) {
    context.beginPath();
    context.moveTo(0, y * cellSize + 0.5);
    context.lineTo(pattern.width * cellSize, y * cellSize + 0.5);
    context.stroke();
  }
  if (includeStats) drawStats(context, pattern.stats, pattern.width * cellSize);
  return canvas;
}

export function downloadPatternPng(pattern: BeadPattern, includeStats: boolean) {
  const canvas = renderPatternToCanvas(pattern, includeStats);
  const link = document.createElement("a");
  link.download = "pixelbead-pattern.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/export-png.test.ts
git add src/lib/pixelbead/crop.ts src/lib/pixelbead/export-png.ts src/lib/pixelbead/export-png.test.ts
git commit -m "feat: extract crops and export pattern pngs"
```

Expected: export size tests pass.

## Task 6: Build Upload, Crop, and Preview Workflow UI

**Files:**
- Create: `src/components/pixelbead/PixelBeadApp.tsx`
- Create: `src/components/pixelbead/UploadStep.tsx`
- Create: `src/components/pixelbead/CropStep.tsx`
- Create: `src/components/pixelbead/PreviewEditor.tsx`
- Create: `src/components/pixelbead/PatternCanvas.tsx`
- Create: `src/components/pixelbead/ColorStats.tsx`
- Create: `src/components/pixelbead/LanguageToggle.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/pixelbead/PixelBeadApp.test.tsx`

- [ ] **Step 1: Write workflow rendering test**

Create `src/components/pixelbead/PixelBeadApp.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelBeadApp } from "./PixelBeadApp";

describe("PixelBeadApp", () => {
  it("renders the upload step in Chinese by default", () => {
    render(<PixelBeadApp />);
    expect(screen.getByRole("heading", { name: "PixelBead" })).toBeVisible();
    expect(screen.getByLabelText("上传图片")).toBeVisible();
    expect(screen.getByText("支持 JPG、PNG、WebP")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/components/pixelbead/PixelBeadApp.test.tsx
```

Expected: failure because `PixelBeadApp.tsx` does not exist.

- [ ] **Step 3: Implement the app shell**

Create `src/components/pixelbead/PixelBeadApp.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import type { BeadPattern, GridSize, Language, WorkflowStep } from "@/lib/pixelbead/types";
import { getCopy } from "@/lib/pixelbead/copy";
import { BEAD_BOARD_PRESETS, getColorCount } from "@/lib/pixelbead/presets";
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
```

- [ ] **Step 4: Implement child components**

Create each child component with these public props:

```ts
// UploadStep.tsx exports UploadStep({ copy, language, onImageLoaded })
// CropStep.tsx exports CropStep({ copy, image, imageUrl, grid, onGridChange, onPatternReady, defaultColorCount })
// PreviewEditor.tsx exports PreviewEditor({ copy, pattern, originalUrl, grid })
// PatternCanvas.tsx exports PatternCanvas({ pattern })
// ColorStats.tsx exports ColorStats({ stats })
// LanguageToggle.tsx exports LanguageToggle({ language, onChange })
```

Use `validateImageFile`, `loadImageFromFile`, `extractGridColors`, `buildPatternFromColors`, `renderPatternToCanvas`, and `downloadPatternPng` from the domain modules. `CropStep` should use `react-image-crop` with an initial square crop and update the target crop ratio when custom grid width and height differ.

- [ ] **Step 5: Wire the route**

Modify `src/app/page.tsx`:

```tsx
import { PixelBeadApp } from "@/components/pixelbead/PixelBeadApp";

export default function Home() {
  return <PixelBeadApp />;
}
```

- [ ] **Step 6: Run UI tests and commit**

Run:

```bash
npm run test -- src/components/pixelbead/PixelBeadApp.test.tsx
npm run build
git add src/app src/components
git commit -m "feat: build PixelBead guided workflow"
```

Expected: component test and production build pass.

## Task 7: Add Complete Error States, Responsive Polish, and Bilingual Coverage

**Files:**
- Modify: `src/components/pixelbead/*.tsx`
- Modify: `src/lib/pixelbead/copy.ts`
- Modify: `src/lib/pixelbead/errors.ts`
- Test: `src/lib/pixelbead/copy.test.ts`
- Test: `src/components/pixelbead/PixelBeadApp.test.tsx`

- [ ] **Step 1: Extend tests for language switching and visible errors**

Append to `src/components/pixelbead/PixelBeadApp.test.tsx`:

```tsx
import userEvent from "@testing-library/user-event";

it("switches upload copy to English", async () => {
  render(<PixelBeadApp />);
  await userEvent.click(screen.getByRole("button", { name: "English" }));
  expect(screen.getByLabelText("Upload image")).toBeVisible();
  expect(screen.getByText("Supports JPG, PNG, and WebP")).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify failure if language button is missing**

Run:

```bash
npm run test -- src/components/pixelbead/PixelBeadApp.test.tsx
```

Expected: fails until `LanguageToggle` exposes an English button with accessible name `English`.

- [ ] **Step 3: Implement complete bilingual UI states**

Update component copy usage so every visible label comes from `getCopy(language)` or `getErrorMessage(language, code)`. Add visible messages for unsupported format, file read failure, image load failure, invalid grid size, invalid color count, missing browser API, and export failure.

- [ ] **Step 4: Apply responsive layout rules**

Update `src/app/globals.css` and component classes so:

```css
button,
input,
select {
  font: inherit;
}

canvas {
  max-width: 100%;
  height: auto;
}
```

Use single-column mobile layout below `768px`; use a two-column editor layout on desktop with preview first and settings second. Keep advanced settings collapsed behind a button or native `<details>`.

- [ ] **Step 5: Run checks and commit**

Run:

```bash
npm run test
npm run build
git add src
git commit -m "feat: polish responsive and bilingual states"
```

Expected: all unit/component tests and production build pass.

## Task 8: Add End-to-End Flow and Final Verification

**Files:**
- Modify: `tests/pixelbead.spec.ts`
- Create: `tests/fixtures/two-color.png`
- Modify: `README.md`

- [ ] **Step 1: Create a deterministic fixture**

Run this command to create `tests/fixtures/two-color.png` as a tiny PNG with red and blue halves:

```bash
mkdir -p tests/fixtures
node -e 'const fs=require("fs");const png="iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAIAAADwyuo0AAAAFElEQVR4nGP8z8AARLJgwiBViQEAJgYCBfP5UccAAAAASUVORK5CYII=";fs.writeFileSync("tests/fixtures/two-color.png", Buffer.from(png, "base64"));'
```

Expected: `tests/fixtures/two-color.png` exists and can be uploaded by Playwright.

- [ ] **Step 2: Replace smoke test with full Playwright flow**

Modify `tests/pixelbead.spec.ts`:

```ts
import path from "node:path";
import { test, expect } from "@playwright/test";

test("converts a local image into an exportable bead pattern", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/上传图片|Upload image/i).setInputFiles(path.join(process.cwd(), "tests/fixtures/two-color.png"));
  await expect(page.getByRole("heading", { name: /裁剪图片|Crop image/i })).toBeVisible();
  await page.getByRole("button", { name: /确认裁剪|Confirm crop/i }).click();
  await expect(page.getByRole("heading", { name: /预览点阵图|Preview pattern/i })).toBeVisible();
  await expect(page.getByText(/#/)).toBeVisible();
  await expect(page.getByRole("button", { name: /导出 PNG|Export PNG/i })).toBeVisible();
});
```

- [ ] **Step 3: Run the app and E2E test**

Run in one terminal:

```bash
npm run dev
```

Run in another terminal:

```bash
npx playwright install chromium
npm run e2e
```

Expected: Playwright completes the upload, crop confirmation, preview, statistics, and export-button visibility flow.

- [ ] **Step 4: Update README**

Modify `README.md` with:

```md
## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run test
npm run build
npm run e2e
```
```

- [ ] **Step 5: Final verification and commit**

Run:

```bash
npm run test
npm run build
npm run e2e
git status --short
```

Expected: all checks pass and `git status --short` only shows intended changes before commit.

Run:

```bash
git add README.md tests
git commit -m "test: cover PixelBead end-to-end flow"
```

## Self-Review Notes

- Spec coverage: Tasks cover Next.js web app, local file upload, manual crop, bead-board presets, custom grid, local image processing, generic palette, three color modes, custom color count, preview toggle, color stats, high-resolution PNG export, optional stats export, bilingual UI, mobile/desktop layout, and common error cases.
- Scope control: AI conversion, brand palettes, PDF export, accounts, project saving, manual cell editing, camera capture, URL import, HEIC/HEIF, background processing, and difficulty estimation remain out of scope.
- Execution boundary: This plan does not implement the feature directly. Implementation should start from Task 1 and commit after each task.
