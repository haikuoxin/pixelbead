# PixelBead Subject-First Conversion Design

Date: 2026-05-16
Status: Draft for implementation planning

## 1. Problem

The MVP conversion pipeline treats every pixel inside the crop as equally important. For real user photos, this causes two visible failures:

1. Busy backgrounds consume the limited bead color budget.
2. The main subject loses continuous shape and semantic identity after downsampling and quantization.

This is not only a portrait problem. PixelBead users may upload a child, a celebrity, Iron Man, a panda, a car, a plush toy, a product photo, food, or any other object. The next product layer should therefore optimize around the image subject, not around humans specifically.

## 2. Product Goal

Build a subject-first conversion mode that becomes the default path for ordinary photos.

The user-facing behavior should be:

- Default conversion mode: subject-first.
- Fallback conversion mode: whole-image conversion.
- Background should not participate in subject-first color quantization by default.
- Source images should still be processed locally in the browser.
- No paid external API should be required.
- The workflow should remain understandable for non-technical pixel bead hobbyists.

## 3. Non-Goals

This phase will not add:

- Paid background-removal APIs.
- Server-side image uploads.
- Generative image completion for occluded or missing subject details.
- Manual brush editing for masks.
- Full project saving.
- Real bead brand palette matching.
- PDF export.
- Interactive SAM-style point prompts.

Manual mask correction can be added later, but the first subject-first version should be automatic with clear fallback.

## 4. Recommended Technical Approach

Use `@imgly/background-removal` for the first subject segmentation implementation.

Reasons:

- It runs directly in the browser.
- It targets general foreground/background removal, not only human portraits.
- It avoids paid external APIs and keeps source images local.
- Its AGPL-3.0 license fits an open-source public repository better than a proprietary closed-source product.

Important licensing note:

- `@imgly/background-removal` is free under AGPL-3.0. That is acceptable for the current open-source project direction, but should be revisited before any closed-source or commercial packaging.
- BRIA RMBG-1.4 is a useful reference model and supports Transformers.js, but its model card says non-commercial use requires a specific license and commercial use requires an agreement. It should not be the default implementation for this project phase.

## 5. User Experience

### 5.1 Conversion Mode

The crop step should expose a simple mode control before the user confirms conversion:

- `主体优先` / `Subject first`
- `整图转换` / `Whole image`

Default: `主体优先`.

Whole-image conversion should keep the current MVP behavior. It is useful for landscapes, icons, flat illustrations, simple compositions, or cases where the user intentionally wants the entire crop.

The preview step should show the selected mode and any subject-quality warnings. It should not be the only place to change conversion mode, because conversion already happens when the user confirms the crop.

### 5.2 Subject-First Defaults

Subject-first mode defaults:

- Background treatment: `不铺豆` / `No background beads`
- Color mode: standard, but with a subject-first standard count of 8 colors
- Detailed count: 12 colors
- Existing custom color count remains available in advanced settings
- Color statistics count only bead cells, not empty background cells

### 5.3 Background Options

Subject-first mode should support:

- `不铺豆` / `No background beads`: background cells are empty and excluded from stats.
- `白色` / `White`: background cells render as white beads or white background, depending on export settings.
- `浅灰` / `Light gray`: background cells render as light gray background.

The first implementation should prioritize `No background beads`. White and light gray can reuse the same background-cell pipeline.

### 5.4 User Feedback

The app should show direct status copy:

- Loading model: local subject detection is loading.
- Processing: subject is being detected locally in the browser.
- Success: subject-first pattern is ready.
- Failure: subject could not be detected; switch to whole-image conversion or adjust crop.

The UI must clearly communicate that images are not uploaded to a server.

## 6. Processing Pipeline

Existing whole-image flow:

```text
image -> crop -> resize to grid -> quantize all grid colors -> palette mapping -> pattern
```

New subject-first flow:

```text
image -> crop -> subject segmentation -> subject mask -> masked grid extraction -> subject-only quantization -> palette mapping -> pattern with bead/empty/background cells
```

## 7. Domain Model Changes

### 7.1 Conversion Mode

Add:

```ts
export type ConversionMode = "subject" | "whole";
```

### 7.2 Background Treatment

Add:

```ts
export type BackgroundTreatment = "empty" | "white" | "lightGray";
```

### 7.3 Pattern Cell Kind

Add:

```ts
export type PatternCellKind = "bead" | "empty" | "background";
```

`bead` cells represent physical beads and count toward statistics.

`empty` cells represent no bead placement.

`background` cells represent a deliberate background fill. The first implementation should render them visually but keep them separate from subject bead statistics unless the UI explicitly says background beads are included.

### 7.4 Subject Mask

Add:

```ts
export interface SubjectMask {
  width: number;
  height: number;
  alpha: Uint8ClampedArray;
}
```

`alpha` contains one 0-255 value per pixel. Values above the implementation threshold are foreground.

## 8. Segmentation Boundary

Create a provider boundary so the rest of PixelBead does not depend directly on `@imgly/background-removal`:

```ts
export interface SubjectSegmentationProvider {
  segment(image: HTMLImageElement, crop: PixelCrop): Promise<SubjectMask>;
}
```

The first provider should use `@imgly/background-removal`.

The provider should return a mask aligned to the natural-image crop dimensions or to a documented internal mask size that can be sampled consistently into the target bead grid.

## 9. Masked Pattern Conversion

Subject-first conversion should:

1. Sample source image colors into the selected grid.
2. Sample subject mask into the same grid.
3. Classify each grid cell as foreground or background.
4. Quantize only foreground cell colors.
5. Map foreground colors to the existing palette.
6. Emit empty/background cells for background grid positions.
7. Count statistics only from foreground bead cells by default.

Mask threshold should be conservative at first:

```ts
const SUBJECT_ALPHA_THRESHOLD = 128;
```

This threshold can become an advanced setting later if needed.

## 10. Subject Quality Signals

Subject-first mode should produce warnings, not hard failures, for imperfect input:

- If foreground area is less than 8% of the grid: subject may be too small.
- If foreground area is more than 92% of the grid: background removal may not be meaningful.
- If foreground bounding box height is less than 24 cells on a detailed subject: recommend cropping closer or using 87 x 87.

These warnings should not block export.

## 11. Edge Protection

The first edge-protection implementation should stay deterministic and simple:

- Detect foreground cells adjacent to background cells.
- Preserve those cells as foreground beads.
- Prefer their original mapped palette color instead of allowing them to be erased by background classification.

Do not add stylized outlines in this phase. Artificial outlines can make some subjects worse, especially cars or light-colored objects.

## 12. Error Handling

Add error codes:

```ts
| "subject_model_load_failed"
| "subject_segmentation_failed"
| "subject_not_found"
```

Expected behavior:

- Model load failure: show a message and keep whole-image conversion available.
- Segmentation failure: show a message and keep whole-image conversion available.
- Subject not found: show a message and suggest whole-image conversion or tighter crop.

## 13. Testing Strategy

Unit tests should cover:

- Mask thresholding.
- Foreground area and bounding-box measurement.
- Masked quantization excludes background pixels.
- Empty/background cells do not pollute subject bead statistics.
- Export renderer handles bead, empty, and background cells.
- Copy dictionary includes Chinese and English subject-mode states.

Component tests should cover:

- Subject-first is selected by default.
- Whole-image mode remains available.
- Subject processing status is visible.
- Segmentation failure shows fallback copy.

E2E should cover:

- Upload image.
- Subject-first mode is default.
- Confirm crop.
- Wait for subject-first result.
- Preview renders.
- Color stats render.
- PNG export control remains available.

## 14. Acceptance Criteria

The phase is complete when:

1. Subject-first conversion is the default mode.
2. Whole-image conversion remains available as fallback.
3. Source images are processed locally in the browser.
4. No paid external API is required.
5. Background cells are excluded from color quantization in subject-first mode.
6. Background cells are excluded from subject bead statistics by default.
7. PNG export supports subject-first patterns.
8. Common segmentation failures show clear bilingual errors.
9. The implementation has unit, component, and E2E coverage.
10. The deployed site can process at least one person photo, one object/character photo, and one animal/toy-style subject without the background dominating the color stats.

## 15. Risks and Mitigations

- Large model download: lazy-load the segmentation package only when the first conversion needs subject mode, and show status copy.
- Mobile performance: keep whole-image mode available, downscale internal segmentation input if needed, and avoid blocking UI without status.
- AGPL license constraints: document the dependency and avoid closed-source redistribution assumptions.
- Segmentation mistakes: expose whole-image fallback and add mask preview later if users need more control.
- Model asset hosting: use the library defaults first, then move assets under `public/` if Vercel/CDN behavior or privacy expectations require tighter control.

## 16. Source Notes

- `imgly/background-removal-js` describes browser and Node.js background removal with no additional costs or privacy concerns, and lists AGPL-3.0 licensing.
- BRIA RMBG-1.4 supports Transformers.js usage, but its model card states non-commercial terms and a separate commercial agreement.
