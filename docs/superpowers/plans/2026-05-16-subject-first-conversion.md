# Subject-First Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make subject-first conversion the default PixelBead path so busy photo backgrounds stop polluting bead patterns while whole-image conversion remains available as fallback.

**Architecture:** Keep the existing MVP whole-image pipeline intact and add a subject-segmentation boundary plus masked conversion path. The UI defaults to subject-first mode, lazy-loads browser-local background removal, and falls back to whole-image conversion when segmentation fails. Pattern rendering and export become cell-kind aware so subject beads, empty cells, and optional background fills are handled consistently.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Testing Library, Playwright, browser Canvas APIs, `@imgly/background-removal`.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add `@imgly/background-removal`.
- Modify `src/lib/pixelbead/types.ts`: add conversion mode, background treatment, subject mask, cell kind, and warnings.
- Create `src/lib/pixelbead/subject-mask.ts`: pure helpers for thresholding, grid sampling, foreground bounds, and quality warnings.
- Create `src/lib/pixelbead/subject-segmentation.ts`: provider interface and dynamic IMG.LY provider loader.
- Create `src/lib/pixelbead/masked-pattern.ts`: subject-first pattern assembly using image colors plus mask.
- Modify `src/lib/pixelbead/pattern.ts`: support `PatternCellKind` without breaking whole-image mode.
- Modify `src/lib/pixelbead/export-png.ts`: render bead, empty, and background cells.
- Modify `src/lib/pixelbead/copy.ts`: add bilingual subject-first mode copy, processing states, warnings, and errors.
- Modify `src/lib/pixelbead/errors.ts`: add subject segmentation error codes.
- Modify `src/lib/pixelbead/presets.ts`: add subject-first color defaults.
- Modify `src/components/pixelbead/PixelBeadApp.tsx`: track conversion mode, background treatment, segmentation status, and warnings.
- Modify `src/components/pixelbead/CropStep.tsx`: expose subject-first/whole-image switch and background options before crop confirmation, then call the selected conversion path.
- Modify `src/components/pixelbead/PreviewEditor.tsx`: show the selected mode and subject warnings after conversion.
- Modify `src/components/pixelbead/PatternCanvas.tsx`: render empty/background cells correctly.
- Modify `src/components/pixelbead/ColorStats.tsx`: show subject bead stats only.
- Add and update unit/component tests under `src/lib/pixelbead/*.test.ts` and `src/components/pixelbead/*.test.tsx`.
- Modify `tests/pixelbead.spec.ts`: verify subject-first is default and export flow still works.

## Task 1: Add Subject Domain Types and Presets

**Files:**
- Modify: `src/lib/pixelbead/types.ts`
- Modify: `src/lib/pixelbead/presets.ts`
- Test: `src/lib/pixelbead/presets.test.ts`

- [ ] **Step 1: Write failing preset/type behavior tests**

Append to `src/lib/pixelbead/presets.test.ts`:

```ts
import { getSubjectColorCount, DEFAULT_CONVERSION_MODE, BACKGROUND_TREATMENTS } from "./presets";

describe("subject-first presets", () => {
  it("uses subject-first conversion by default", () => {
    expect(DEFAULT_CONVERSION_MODE).toBe("subject");
  });

  it("uses higher subject-first color counts than the original simple mode", () => {
    expect(getSubjectColorCount("standard")).toBe(8);
    expect(getSubjectColorCount("detailed")).toBe(12);
  });

  it("defaults to no background beads", () => {
    expect(BACKGROUND_TREATMENTS[0]).toMatchObject({ id: "empty" });
  });
});
```

- [ ] **Step 2: Run the targeted test and verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/presets.test.ts
```

Expected: FAIL because `getSubjectColorCount`, `DEFAULT_CONVERSION_MODE`, and `BACKGROUND_TREATMENTS` do not exist.

- [ ] **Step 3: Add domain types**

Modify `src/lib/pixelbead/types.ts` to add:

```ts
export type ConversionMode = "subject" | "whole";

export type BackgroundTreatment = "empty" | "white" | "lightGray";

export type PatternCellKind = "bead" | "empty" | "background";

export type SubjectWarningCode = "subject_too_small" | "subject_fills_crop" | "subject_detail_low";

export interface SubjectMask {
  width: number;
  height: number;
  alpha: Uint8ClampedArray;
}

export interface SubjectWarning {
  code: SubjectWarningCode;
}
```

Update the existing `PatternCell` interface:

```ts
kind: PatternCellKind;
```

The current `PatternCell` interface already contains `x`, `y`, and `color`; add `kind` as a required property and make the existing whole-image builder emit `kind: "bead"` in Task 3.

- [ ] **Step 4: Add presets**

Modify `src/lib/pixelbead/presets.ts`:

```ts
import type { BackgroundTreatment, ColorMode, ConversionMode } from "./types";

export const DEFAULT_CONVERSION_MODE: ConversionMode = "subject";

export const BACKGROUND_TREATMENTS: readonly { id: BackgroundTreatment; labelKey: BackgroundTreatment }[] = Object.freeze([
  { id: "empty", labelKey: "empty" },
  { id: "white", labelKey: "white" },
  { id: "lightGray", labelKey: "lightGray" },
]);

export function getSubjectColorCount(mode: ColorMode): number {
  const counts: Record<ColorMode, number> = {
    simple: 6,
    standard: 8,
    detailed: 12,
  };

  return counts[mode];
}
```

Keep the existing `getColorCount` unchanged for whole-image mode.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/presets.test.ts
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/lib/pixelbead/types.ts src/lib/pixelbead/presets.ts src/lib/pixelbead/presets.test.ts
git commit -m "feat: add subject-first domain presets"
```

## Task 2: Add Subject Mask Helpers

**Files:**
- Create: `src/lib/pixelbead/subject-mask.ts`
- Test: `src/lib/pixelbead/subject-mask.test.ts`

- [ ] **Step 1: Write failing subject mask tests**

Create `src/lib/pixelbead/subject-mask.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  SUBJECT_ALPHA_THRESHOLD,
  classifyMaskCell,
  getSubjectBounds,
  getSubjectWarnings,
  sampleMaskToGrid,
} from "./subject-mask";
import type { SubjectMask } from "./types";

function mask(width: number, height: number, alpha: number[]): SubjectMask {
  return { width, height, alpha: Uint8ClampedArray.from(alpha) };
}

describe("subject mask helpers", () => {
  it("classifies alpha values using the subject threshold", () => {
    expect(SUBJECT_ALPHA_THRESHOLD).toBe(128);
    expect(classifyMaskCell(127)).toBe(false);
    expect(classifyMaskCell(128)).toBe(true);
  });

  it("samples a source mask into a bead grid", () => {
    const sampled = sampleMaskToGrid(
      mask(4, 4, [
        255, 255, 0, 0,
        255, 255, 0, 0,
        0, 0, 255, 255,
        0, 0, 255, 255,
      ]),
      { width: 2, height: 2 },
    );

    expect(sampled).toEqual([true, false, false, true]);
  });

  it("computes foreground bounds", () => {
    expect(getSubjectBounds([false, true, false, false, true, false], { width: 3, height: 2 })).toEqual({
      x: 1,
      y: 0,
      width: 1,
      height: 2,
    });
  });

  it("reports small and oversized subjects", () => {
    expect(getSubjectWarnings([true, false, false, false], { width: 2, height: 2 }).map((warning) => warning.code)).toContain("subject_detail_low");
    expect(getSubjectWarnings([true, true, true, true], { width: 2, height: 2 }).map((warning) => warning.code)).toContain("subject_fills_crop");
  });
});
```

- [ ] **Step 2: Run the targeted test and verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/subject-mask.test.ts
```

Expected: FAIL because `subject-mask.ts` does not exist.

- [ ] **Step 3: Implement subject mask helpers**

Create `src/lib/pixelbead/subject-mask.ts`:

```ts
import type { GridSize, SubjectMask, SubjectWarning } from "./types";

export const SUBJECT_ALPHA_THRESHOLD = 128;

export interface SubjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function classifyMaskCell(alpha: number): boolean {
  return alpha >= SUBJECT_ALPHA_THRESHOLD;
}

export function sampleMaskToGrid(mask: SubjectMask, grid: GridSize): boolean[] {
  const cells: boolean[] = [];

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const startX = Math.floor((x / grid.width) * mask.width);
      const endX = Math.max(startX + 1, Math.floor(((x + 1) / grid.width) * mask.width));
      const startY = Math.floor((y / grid.height) * mask.height);
      const endY = Math.max(startY + 1, Math.floor(((y + 1) / grid.height) * mask.height));
      let foreground = 0;
      let total = 0;

      for (let sourceY = startY; sourceY < Math.min(endY, mask.height); sourceY += 1) {
        for (let sourceX = startX; sourceX < Math.min(endX, mask.width); sourceX += 1) {
          foreground += classifyMaskCell(mask.alpha[sourceY * mask.width + sourceX]) ? 1 : 0;
          total += 1;
        }
      }

      cells.push(total > 0 && foreground / total >= 0.5);
    }
  }

  return cells;
}

export function getSubjectBounds(foreground: boolean[], grid: GridSize): SubjectBounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  foreground.forEach((isForeground, index) => {
    if (!isForeground) return;
    const x = index % grid.width;
    const y = Math.floor(index / grid.width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (!Number.isFinite(minX)) return null;

  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export function getSubjectWarnings(foreground: boolean[], grid: GridSize): SubjectWarning[] {
  const foregroundCount = foreground.filter(Boolean).length;
  const ratio = foregroundCount / foreground.length;
  const bounds = getSubjectBounds(foreground, grid);
  const warnings: SubjectWarning[] = [];

  if (ratio < 0.08) warnings.push({ code: "subject_too_small" });
  if (ratio > 0.92) warnings.push({ code: "subject_fills_crop" });
  if (bounds && bounds.height < 24) warnings.push({ code: "subject_detail_low" });

  return warnings;
}
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/subject-mask.test.ts
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/lib/pixelbead/subject-mask.ts src/lib/pixelbead/subject-mask.test.ts
git commit -m "feat: add subject mask helpers"
```

## Task 3: Make Pattern Cells Kind-Aware

**Files:**
- Modify: `src/lib/pixelbead/pattern.ts`
- Modify: `src/lib/pixelbead/export-png.ts`
- Test: `src/lib/pixelbead/pattern.test.ts`
- Test: `src/lib/pixelbead/export-png.test.ts`

- [ ] **Step 1: Write failing tests for cell kinds**

Append to `src/lib/pixelbead/pattern.test.ts`:

```ts
it("marks whole-image cells as bead cells", () => {
  const pattern = buildPatternFromColors(
    [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    ],
    { width: 2, height: 1 },
    2,
  );

  expect(pattern.cells.every((cell) => cell.kind === "bead")).toBe(true);
});
```

Append to `src/lib/pixelbead/export-png.test.ts`:

```ts
it("does not render empty cells as colored beads", async () => {
  const pattern = {
    width: 1,
    height: 1,
    cells: [{ x: 0, y: 0, kind: "empty" as const, color: { r: 0, g: 0, b: 0, hex: "#000000" } }],
    stats: [],
  };

  expect(() => renderPatternToCanvas(pattern, false)).not.toThrow();
});
```

- [ ] **Step 2: Run targeted tests and verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/pattern.test.ts src/lib/pixelbead/export-png.test.ts
```

Expected: FAIL until cell kinds are emitted and export handles empty cells.

- [ ] **Step 3: Emit bead kind in whole-image conversion**

Modify the cell creation in `src/lib/pixelbead/pattern.ts`:

```ts
return { x: index % grid.width, y: Math.floor(index / grid.width), color, kind: "bead" as const };
```

Update the stats loop:

```ts
for (const cell of cells) {
  if (cell.kind !== "bead") continue;
  const current = counts.get(cell.color.hex) ?? { color: cell.color, count: 0 };
  current.count += 1;
  counts.set(cell.color.hex, current);
}
```

- [ ] **Step 4: Render empty/background cells in export**

Modify the cell rendering loop in `src/lib/pixelbead/export-png.ts` so it uses:

```ts
if (cell.kind === "empty") {
  context.fillStyle = "#ffffff";
} else {
  context.fillStyle = cell.color.hex;
}
```

Keep grid line rendering unchanged. This first pass renders empty cells as white paper space in PNG.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/pattern.test.ts src/lib/pixelbead/export-png.test.ts
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/lib/pixelbead/pattern.ts src/lib/pixelbead/export-png.ts src/lib/pixelbead/pattern.test.ts src/lib/pixelbead/export-png.test.ts
git commit -m "feat: support pattern cell kinds"
```

## Task 4: Add Masked Pattern Assembly

**Files:**
- Create: `src/lib/pixelbead/masked-pattern.ts`
- Test: `src/lib/pixelbead/masked-pattern.test.ts`

- [ ] **Step 1: Write failing masked pattern tests**

Create `src/lib/pixelbead/masked-pattern.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildMaskedPatternFromColors } from "./masked-pattern";

describe("buildMaskedPatternFromColors", () => {
  it("excludes background cells from color statistics", () => {
    const pattern = buildMaskedPatternFromColors(
      [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ],
      [true, false],
      { width: 2, height: 1 },
      2,
      { backgroundTreatment: "empty" },
    );

    expect(pattern.cells.map((cell) => cell.kind)).toEqual(["bead", "empty"]);
    expect(pattern.stats).toHaveLength(1);
    expect(pattern.stats[0].count).toBe(1);
  });

  it("uses background cells for deliberate background fill", () => {
    const pattern = buildMaskedPatternFromColors(
      [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ],
      [true, false],
      { width: 2, height: 1 },
      2,
      { backgroundTreatment: "white" },
    );

    expect(pattern.cells[1]).toMatchObject({ kind: "background", color: { hex: "#ffffff" } });
    expect(pattern.stats).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run targeted test and verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/masked-pattern.test.ts
```

Expected: FAIL because `masked-pattern.ts` does not exist.

- [ ] **Step 3: Implement masked pattern assembly**

Create `src/lib/pixelbead/masked-pattern.ts`:

```ts
import { codedError } from "./coded-error";
import { nearestPaletteColor, hexToRgb } from "./palette";
import { quantizeColors } from "./quantize";
import type { BackgroundTreatment, BeadPattern, GridSize, PaletteColor, RgbColor } from "./types";

interface MaskedPatternOptions {
  backgroundTreatment: BackgroundTreatment;
  palette?: readonly PaletteColor[];
}

const BACKGROUND_COLORS: Record<Exclude<BackgroundTreatment, "empty">, PaletteColor> = {
  white: { ...hexToRgb("#ffffff"), hex: "#ffffff" },
  lightGray: { ...hexToRgb("#d1d5db"), hex: "#d1d5db" },
};

export function buildMaskedPatternFromColors(
  colors: RgbColor[],
  foreground: boolean[],
  grid: GridSize,
  colorCount: number,
  options: MaskedPatternOptions,
): BeadPattern {
  if (colors.length !== grid.width * grid.height || foreground.length !== colors.length) {
    throw codedError("invalid_grid_size");
  }

  const subjectColors = colors.filter((_, index) => foreground[index]);
  if (subjectColors.length === 0) {
    throw codedError("subject_not_found");
  }

  const quantizedSubjectColors = quantizeColors(subjectColors, colorCount);
  let subjectIndex = 0;

  const cells = colors.map((_, index) => {
    const x = index % grid.width;
    const y = Math.floor(index / grid.width);

    if (!foreground[index]) {
      if (options.backgroundTreatment === "empty") {
        return { x, y, kind: "empty" as const, color: BACKGROUND_COLORS.white };
      }

      return { x, y, kind: "background" as const, color: BACKGROUND_COLORS[options.backgroundTreatment] };
    }

    const color = nearestPaletteColor(quantizedSubjectColors[subjectIndex], options.palette);
    subjectIndex += 1;

    return { x, y, kind: "bead" as const, color };
  });

  const counts = new Map<string, { color: BeadPattern["cells"][number]["color"]; count: number }>();
  for (const cell of cells) {
    if (cell.kind !== "bead") continue;
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

- [ ] **Step 4: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/masked-pattern.test.ts
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/lib/pixelbead/masked-pattern.ts src/lib/pixelbead/masked-pattern.test.ts
git commit -m "feat: build masked subject patterns"
```

## Task 5: Add Subject Segmentation Provider Boundary

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/pixelbead/subject-segmentation.ts`
- Test: `src/lib/pixelbead/subject-segmentation.test.ts`

- [ ] **Step 1: Install browser-local background removal dependency**

Run:

```bash
npm install @imgly/background-removal
```

Expected: `package.json` includes `@imgly/background-removal`.

- [ ] **Step 2: Write provider tests with a mock implementation**

Create `src/lib/pixelbead/subject-segmentation.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createSubjectSegmentationProvider } from "./subject-segmentation";

describe("subject segmentation provider", () => {
  it("converts a returned alpha image into a SubjectMask", async () => {
    const provider = createSubjectSegmentationProvider(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "rgba(0, 0, 0, 1)";
      context.fillRect(0, 0, 1, 1);
      return new Blob([new Uint8Array([1])], { type: "image/png" });
    });

    await expect(provider.segment({} as HTMLImageElement, { x: 0, y: 0, width: 1, height: 1 })).rejects.toMatchObject({
      code: "subject_segmentation_failed",
    });
  });

  it("wraps dependency failures as subject segmentation failures", async () => {
    const provider = createSubjectSegmentationProvider(vi.fn().mockRejectedValue(new Error("model failed")));

    await expect(provider.segment({} as HTMLImageElement, { x: 0, y: 0, width: 1, height: 1 })).rejects.toMatchObject({
      code: "subject_segmentation_failed",
    });
  });
});
```

This test intentionally verifies error wrapping first. Browser image decoding of returned model blobs is covered by integration/E2E because jsdom cannot reliably decode PNG blobs.

- [ ] **Step 3: Implement provider boundary**

Create `src/lib/pixelbead/subject-segmentation.ts`:

```ts
import { codedError } from "./coded-error";
import type { PixelCrop } from "./crop";
import type { SubjectMask } from "./types";

type RemoveBackground = (input: Blob | HTMLCanvasElement | HTMLImageElement) => Promise<Blob>;

export interface SubjectSegmentationProvider {
  segment(image: HTMLImageElement, crop: PixelCrop): Promise<SubjectMask>;
}

function cropImageToCanvas(image: HTMLImageElement, crop: PixelCrop): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const context = canvas.getContext("2d");
  if (!context) throw codedError("missing_browser_api");
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function blobToMask(blob: Blob): Promise<SubjectMask> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw codedError("missing_browser_api");
  context.drawImage(bitmap, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const alpha = new Uint8ClampedArray(canvas.width * canvas.height);

  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = imageData[index * 4 + 3];
  }

  return { width: canvas.width, height: canvas.height, alpha };
}

export function createSubjectSegmentationProvider(removeBackground: RemoveBackground): SubjectSegmentationProvider {
  return {
    async segment(image, crop) {
      try {
        const cropped = cropImageToCanvas(image, crop);
        const result = await removeBackground(cropped);
        return await blobToMask(result);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) throw error;
        throw codedError("subject_segmentation_failed");
      }
    },
  };
}

export async function createImglySubjectSegmentationProvider(): Promise<SubjectSegmentationProvider> {
  try {
    const module = await import("@imgly/background-removal");
    return createSubjectSegmentationProvider(module.removeBackground);
  } catch {
    throw codedError("subject_model_load_failed");
  }
}
```

- [ ] **Step 4: Add error codes**

Modify `src/lib/pixelbead/types.ts` `PixelBeadErrorCode` union:

```ts
| "subject_model_load_failed"
| "subject_segmentation_failed"
| "subject_not_found"
```

Modify `src/lib/pixelbead/errors.ts` with bilingual messages for the three new codes.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/subject-segmentation.test.ts src/lib/pixelbead/errors.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

Commit:

```bash
git add package.json package-lock.json src/lib/pixelbead/subject-segmentation.ts src/lib/pixelbead/subject-segmentation.test.ts src/lib/pixelbead/types.ts src/lib/pixelbead/errors.ts src/lib/pixelbead/errors.test.ts
git commit -m "feat: add subject segmentation provider"
```

## Task 6: Wire Subject-First Conversion into Workflow State

**Files:**
- Modify: `src/components/pixelbead/PixelBeadApp.tsx`
- Modify: `src/components/pixelbead/CropStep.tsx`
- Test: `src/components/pixelbead/PixelBeadApp.subject.test.tsx`

- [ ] **Step 1: Write failing workflow tests**

Create `src/components/pixelbead/PixelBeadApp.subject.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PixelBeadApp } from "./PixelBeadApp";

vi.mock("./UploadStep", () => ({
  UploadStep: ({ onImageLoaded }: { onImageLoaded: (loaded: { element: HTMLImageElement; url: string; revoke: () => void }) => void }) => (
    <button
      type="button"
      onClick={() => {
        const image = document.createElement("img");
        Object.defineProperty(image, "naturalWidth", { value: 100 });
        Object.defineProperty(image, "naturalHeight", { value: 100 });
        onImageLoaded({ element: image, url: "blob:image", revoke: vi.fn() });
      }}
    >
      mock upload
    </button>
  ),
}));

vi.mock("./CropStep", () => ({
  CropStep: (props: { conversionMode: string; backgroundTreatment: string; isSubjectProcessing: boolean }) => (
    <div data-testid="crop-step" data-mode={props.conversionMode} data-background={props.backgroundTreatment} data-processing={String(props.isSubjectProcessing)} />
  ),
}));

describe("PixelBeadApp subject workflow state", () => {
  it("passes subject-first defaults to the crop step", () => {
    render(<PixelBeadApp />);

    fireEvent.click(screen.getByRole("button", { name: "mock upload" }));

    expect(screen.getByTestId("crop-step")).toHaveAttribute("data-mode", "subject");
    expect(screen.getByTestId("crop-step")).toHaveAttribute("data-background", "empty");
    expect(screen.getByTestId("crop-step")).toHaveAttribute("data-processing", "false");
  });
});
```

- [ ] **Step 2: Run targeted test and verify failure**

Run:

```bash
npm run test -- src/components/pixelbead/PixelBeadApp.subject.test.tsx
```

Expected: FAIL because `PixelBeadApp` does not pass subject workflow props to `CropStep`.

- [ ] **Step 3: Add workflow state**

In `PixelBeadApp.tsx`, add state:

```ts
const [conversionMode, setConversionMode] = useState<ConversionMode>(DEFAULT_CONVERSION_MODE);
const [backgroundTreatment, setBackgroundTreatment] = useState<BackgroundTreatment>("empty");
const [subjectWarnings, setSubjectWarnings] = useState<SubjectWarning[]>([]);
const [isSubjectProcessing, setIsSubjectProcessing] = useState(false);
```

Pass these values and setters to `CropStep`. Pass `conversionMode` and `subjectWarnings` to `PreviewEditor`.

- [ ] **Step 4: Convert after crop based on selected mode**

In `CropStep.tsx`, update the confirm handler logic:

```ts
if (conversionMode === "subject") {
  onSubjectProcessingChange(true);
  try {
    const provider = await createImglySubjectSegmentationProvider();
    const mask = await provider.segment(image, naturalCrop);
    const foreground = sampleMaskToGrid(mask, grid);
    const warnings = getSubjectWarnings(foreground, grid);
    const colors = extractGridColors(image, naturalCrop, grid);
    const pattern = buildMaskedPatternFromColors(colors, foreground, grid, colorCount, { backgroundTreatment });
    const croppedPreviewUrl = await createCroppedPreviewUrl(image, naturalCrop);
    onSubjectWarningsChange(warnings);
    onPatternReady(pattern, croppedPreviewUrl);
  } finally {
    onSubjectProcessingChange(false);
  }
} else {
  const colors = extractGridColors(image, naturalCrop, grid);
  const pattern = buildPatternFromColors(colors, grid, colorCount);
  const croppedPreviewUrl = await createCroppedPreviewUrl(image, naturalCrop);
  onSubjectWarningsChange([]);
  onPatternReady(pattern, croppedPreviewUrl);
}
```

Add these props to `CropStepProps` during this task:

```ts
conversionMode: ConversionMode;
backgroundTreatment: BackgroundTreatment;
onSubjectWarningsChange: (warnings: SubjectWarning[]) => void;
onSubjectProcessingChange: (processing: boolean) => void;
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/components/pixelbead/PixelBeadApp.subject.test.tsx
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/components/pixelbead/PixelBeadApp.tsx src/components/pixelbead/CropStep.tsx src/components/pixelbead/PixelBeadApp.subject.test.tsx
git commit -m "feat: make subject conversion the default workflow"
```

## Task 7: Add Subject Mode Controls, Preview Warnings, and Copy

**Files:**
- Modify: `src/lib/pixelbead/copy.ts`
- Modify: `src/lib/pixelbead/copy.test.ts`
- Modify: `src/components/pixelbead/CropStep.tsx`
- Modify: `src/components/pixelbead/PreviewEditor.tsx`
- Test: `src/components/pixelbead/CropStep.test.tsx`
- Test: `src/components/pixelbead/PreviewEditor.test.tsx`

- [ ] **Step 1: Write failing copy and component tests**

Append to `src/lib/pixelbead/copy.test.ts`:

```ts
it("includes subject-first conversion copy", () => {
  expect(getCopy("zh").conversion.subject).toContain("主体");
  expect(getCopy("en").conversion.subject).toContain("Subject");
});
```

Append to `src/components/pixelbead/PreviewEditor.test.tsx`:

```tsx
it("shows subject warnings when provided", () => {
  render(
    <PreviewEditor
      copy={getCopy("zh")}
      language="zh"
      pattern={pattern}
      originalUrl="blob:crop"
      grid={{ width: 1, height: 1 }}
      conversionMode="subject"
      subjectWarnings={[{ code: "subject_detail_low" }]}
    />,
  );

  expect(screen.getByText(/主体|细节|裁剪/)).toBeInTheDocument();
});
```

Create `src/components/pixelbead/CropStep.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getCopy } from "../../lib/pixelbead/copy";
import { CropStep } from "./CropStep";

vi.mock("react-image-crop", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  centerCrop: (crop: unknown) => crop,
  makeAspectCrop: (crop: unknown) => crop,
}));

function imageElement() {
  const image = document.createElement("img");
  Object.defineProperty(image, "naturalWidth", { value: 100 });
  Object.defineProperty(image, "naturalHeight", { value: 100 });
  return image;
}

describe("CropStep subject controls", () => {
  it("selects subject-first mode by default", () => {
    render(
      <CropStep
        copy={getCopy("zh")}
        image={imageElement()}
        imageUrl="blob:image"
        language="zh"
        grid={{ width: 58, height: 58 }}
        onGridChange={vi.fn()}
        onPatternReady={vi.fn()}
        defaultColorCount={8}
        conversionMode="subject"
        onConversionModeChange={vi.fn()}
        backgroundTreatment="empty"
        onBackgroundTreatmentChange={vi.fn()}
        onSubjectWarningsChange={vi.fn()}
        onSubjectProcessingChange={vi.fn()}
        isSubjectProcessing={false}
      />,
    );

    expect(screen.getByRole("button", { name: "主体优先" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "不铺豆" })).toHaveAttribute("aria-pressed", "true");
  });
});
```

- [ ] **Step 2: Run targeted tests and verify failure**

Run:

```bash
npm run test -- src/lib/pixelbead/copy.test.ts src/components/pixelbead/PreviewEditor.test.tsx
```

Expected: FAIL until copy and UI props are added.

- [ ] **Step 3: Add copy**

Modify `src/lib/pixelbead/copy.ts` to include:

```ts
conversion: {
  title: "转换模式",
  subject: "主体优先",
  whole: "整图转换",
  subjectHint: "适合人物、动物、车辆、玩具、角色、商品等照片。",
  wholeHint: "适合风景、图标、简单背景或想保留完整画面的图片。",
},
background: {
  title: "背景",
  empty: "不铺豆",
  white: "白色",
  lightGray: "浅灰",
},
subject: {
  loading: "正在加载本地主体识别模型...",
  processing: "正在本地识别主体，不会上传图片。",
  subject_detail_low: "主体在当前尺寸下细节偏少，建议裁剪更近或使用 87 x 87。",
  subject_too_small: "主体占比偏小，建议重新裁剪。",
  subject_fills_crop: "主体几乎填满裁剪区域，背景抠除可能不明显。",
}
```

Add matching English copy.

- [ ] **Step 4: Add controls to CropStep**

In `CropStep.tsx`, add mode and background controls above the advanced settings:

```tsx
<section aria-label={copy.conversion.title}>
  <button type="button" aria-pressed={conversionMode === "subject"} onClick={() => onConversionModeChange("subject")}>
    {copy.conversion.subject}
  </button>
  <button type="button" aria-pressed={conversionMode === "whole"} onClick={() => onConversionModeChange("whole")}>
    {copy.conversion.whole}
  </button>
</section>
```

Show background options only when `conversionMode === "subject"`.

Add props to `CropStepProps`:

```ts
conversionMode: ConversionMode;
onConversionModeChange: (mode: ConversionMode) => void;
backgroundTreatment: BackgroundTreatment;
onBackgroundTreatmentChange: (treatment: BackgroundTreatment) => void;
isSubjectProcessing: boolean;
onSubjectWarningsChange: (warnings: SubjectWarning[]) => void;
onSubjectProcessingChange: (processing: boolean) => void;
```

Disable the confirm button when `isSubjectProcessing` is true.

- [ ] **Step 5: Show subject metadata in PreviewEditor**

Add props to `PreviewEditorProps`:

```ts
conversionMode: ConversionMode;
subjectWarnings: SubjectWarning[];
```

Show warning messages under the preview header:

```tsx
{subjectWarnings.map((warning) => (
  <p key={warning.code} className="text-sm font-medium text-amber-700">
    {copy.subject[warning.code]}
  </p>
))}
```

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm run test -- src/lib/pixelbead/copy.test.ts src/components/pixelbead/CropStep.test.tsx src/components/pixelbead/PreviewEditor.test.tsx
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/lib/pixelbead/copy.ts src/lib/pixelbead/copy.test.ts src/components/pixelbead/CropStep.tsx src/components/pixelbead/CropStep.test.tsx src/components/pixelbead/PreviewEditor.tsx src/components/pixelbead/PreviewEditor.test.tsx
git commit -m "feat: add subject conversion controls"
```

## Task 8: Update Canvas Preview and Export Rendering

**Files:**
- Modify: `src/components/pixelbead/PatternCanvas.tsx`
- Modify: `src/lib/pixelbead/export-png.ts`
- Test: `src/components/pixelbead/PatternCanvas.test.tsx`
- Test: `src/lib/pixelbead/export-png.test.ts`

- [ ] **Step 1: Write rendering tests**

Create or append `src/components/pixelbead/PatternCanvas.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PatternCanvas } from "./PatternCanvas";

describe("PatternCanvas subject cells", () => {
  it("renders a pattern with empty cells without crashing", () => {
    const pattern = {
      width: 1,
      height: 1,
      cells: [{ x: 0, y: 0, kind: "empty" as const, color: { r: 255, g: 255, b: 255, hex: "#ffffff" } }],
      stats: [],
    };

    expect(() => render(<PatternCanvas pattern={pattern} label="Pattern preview" />)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run targeted tests and verify failure if component is not kind-aware**

Run:

```bash
npm run test -- src/components/pixelbead/PatternCanvas.test.tsx src/lib/pixelbead/export-png.test.ts
```

Expected: FAIL if `PatternCanvas` assumes every cell is a colored bead.

- [ ] **Step 3: Confirm preview rendering uses the shared renderer**

`PatternCanvas.tsx` currently delegates drawing to `renderPatternToCanvas(pattern, false)`. Keep that delegation and make the shared renderer cell-kind aware in `export-png.ts`:

```ts
if (cell.kind === "empty") {
  context.fillStyle = "#ffffff";
} else {
  context.fillStyle = cell.color.hex;
}
```

Keep grid lines visible over empty cells.

- [ ] **Step 4: Update export rendering**

In `export-png.ts`, replace the current unconditional cell fill:

```ts
context.fillStyle = cell.color.hex;
context.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
```

with:

```ts
context.fillStyle = cell.kind === "empty" ? "#ffffff" : cell.color.hex;
context.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
```

Keep `drawStats(context, pattern.stats, pattern.width * cellSize)` unchanged so stats export prints only `pattern.stats`.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/components/pixelbead/PatternCanvas.test.tsx src/lib/pixelbead/export-png.test.ts
npm run test
```

Expected: all tests pass.

Commit:

```bash
git add src/components/pixelbead/PatternCanvas.tsx src/components/pixelbead/PatternCanvas.test.tsx src/lib/pixelbead/export-png.ts src/lib/pixelbead/export-png.test.ts
git commit -m "feat: render subject background cells"
```

## Task 9: Add E2E Coverage for Subject-First Default

**Files:**
- Modify: `tests/pixelbead.spec.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Stabilize subject dependency for E2E**

Add a test-only subject mask bypass controlled by:

```ts
process.env.NEXT_PUBLIC_PIXELBEAD_E2E_SUBJECT_MASK === "checker"
```

In browser code, only read this env flag to return a deterministic foreground mask in test builds. Do not expose it in normal UI.

Modify `playwright.config.ts` web server command:

```ts
command: "NEXT_PUBLIC_PIXELBEAD_E2E_SUBJECT_MASK=checker npm run dev",
```

- [ ] **Step 2: Extend Playwright test**

Modify `tests/pixelbead.spec.ts`:

```ts
test("uses subject-first conversion by default", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "tests/fixtures/two-color.png"));
  await expect(page.getByRole("button", { name: /主体优先|Subject first/i })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /确认裁剪|Confirm crop/i }).click();
  await expect(page.getByRole("button", { name: /导出 PNG|Export PNG/i })).toBeVisible();
});
```

- [ ] **Step 3: Run E2E**

Run:

```bash
npm run e2e
```

Expected: Playwright confirms subject-first default and export control.

- [ ] **Step 4: Commit**

Run:

```bash
git add tests src
git commit -m "test: cover subject-first conversion flow"
```

## Task 10: Final Verification, Documentation, and Deployment

**Files:**
- Modify: `README.md`
- Modify: docs if implementation notes changed

- [ ] **Step 1: Update README**

Add a short feature note:

```md
## Subject-First Conversion

PixelBead defaults to subject-first conversion for ordinary photos. The app detects the foreground subject locally in the browser, excludes background pixels from color quantization, and keeps whole-image conversion available as a fallback.

Images are not uploaded to a server for conversion.
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

Expected:

- ESLint exits 0.
- Vitest exits 0.
- Next.js production build exits 0.
- Playwright exits 0.

- [ ] **Step 3: Commit README**

Run:

```bash
git add README.md
git commit -m "docs: document subject-first conversion"
```

- [ ] **Step 4: Merge and deploy**

After review approval:

```bash
git checkout main
git pull --ff-only
git merge codex/subject-first-conversion
git push origin main
npx vercel@latest --prod
```

Expected: production deployment is `READY`.

## Self-Review Notes

- Spec coverage: The plan covers subject-first default, whole-image fallback, local browser segmentation, no paid API, masked quantization, empty/background cells, stats behavior, export behavior, error handling, tests, and deployment.
- Scope control: Manual mask correction, SAM prompts, server-side processing, paid APIs, brand palettes, PDF export, and project saving remain out of scope.
- Licensing: The plan documents `@imgly/background-removal` AGPL-3.0 implications and avoids RMBG-1.4 as the default because of non-commercial/commercial-license constraints.
