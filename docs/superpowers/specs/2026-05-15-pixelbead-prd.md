# PixelBead Product Requirements Document

Date: 2026-05-15
Status: Approved draft for implementation planning

## 1. Product Positioning

PixelBead is a web tool that turns ordinary photos into pixel bead pattern references.

The first phase should be close to a release-quality MVP, not a rough demo. It should let real users upload an image, crop it, convert it into a bead-friendly pixel grid, preview the result, see color counts, and export a clear PNG reference.

The primary audience is ordinary pixel bead hobbyists who do not understand image processing. The product should also expose advanced settings for experienced users, but the default workflow must stay simple.

## 2. Product Shape

PixelBead will be a Next.js / React web application.

The first version must support both mobile and desktop browsers. Mobile users should be able to upload from their photo library and save the exported PNG. Desktop users should have a complete and comfortable editing workflow.

Image processing must happen locally in the browser for the first version. Source images should not be uploaded to a server. The architecture should still leave room for future server-side processing if browser performance becomes a limitation.

The interface must support both Chinese and English. A lightweight copy dictionary is enough for the first version; a complex internationalization framework is not required.

## 3. First-Version Scope

The first version includes:

- Local image upload for JPG, PNG, and WebP.
- Manual image cropping.
- Common bead-board size presets.
- Custom grid size input.
- Square default workflow.
- Non-square patterns only through custom size.
- Browser-local pixelation and color quantization.
- General-purpose palette support, with data structures ready for future brand palettes.
- Color modes: simple, standard, and detailed.
- Advanced custom color count.
- Original image and converted result toggle preview.
- Color statistics with swatch, HEX value, and bead count.
- High-resolution PNG export with clear grid lines.
- Optional inclusion of color statistics in the exported PNG.
- Clear error handling for common failure cases.

## 4. Explicit Non-Goals

The first version will not include:

- AI style transfer or AI pixel-art conversion.
- Brand palette mapping.
- Color names, brand color codes, or color-number legends.
- PDF export.
- Accounts, cloud saving, history, or local drafts.
- Project file import or export.
- Manual single-cell color editing.
- Drawing tools, brush tools, or eraser tools.
- Camera capture entry point.
- Image URL import.
- HEIC or HEIF support.
- Background removal, transparent background handling, or background weakening.
- Work difficulty estimation.

## 5. User Flow

The product uses a guided start plus editor flow.

### 5.1 Entry

The first screen should be the tool itself, not a marketing landing page.

The entry screen should emphasize:

- Upload image.
- Supported formats.
- Language switch.

If the user uploads an unsupported or invalid file, the app should show a clear error and explain what to do next.

### 5.2 Crop

After upload, the user enters a manual crop step.

The default crop frame is square. The user can select a common bead-board size such as 29x29, 58x58, or 87x87. The app also provides a custom size entry point.

Custom size mode allows width and height grid counts, including non-square dimensions. The crop ratio should follow the selected target grid ratio.

The crop screen should show:

- The uploaded image.
- The crop frame.
- The selected target grid size.
- A primary confirmation action.

### 5.3 Preview Editor

After crop confirmation, the user enters the preview editor.

This is the main working screen. It should let the user switch between the original crop and the converted bead pattern. It should not require desktop side-by-side comparison in the first version.

The editor should expose:

- Size setting.
- Color mode setting.
- Advanced settings.
- Export options.
- Color statistics.

Default controls should be simple. Advanced settings should be collapsed by default and should include custom grid dimensions and custom color count.

### 5.4 Export

The app exports PNG files.

The default export is a high-resolution pattern image with visible grid lines. The exported image should be scaled up from the grid, not exported at the raw grid size.

Users can choose whether to include color statistics in the same exported PNG.

The first version does not save projects. Refreshing the page may discard the current work.

## 6. Core Functional Requirements

### 6.1 Image Upload

The app must support local file upload for JPG, PNG, and WebP.

The app must reject unsupported formats with a clear message. HEIC and HEIF are not supported in the first version.

All image reading and processing should happen in the browser.

### 6.2 Manual Cropping

The user must be able to adjust the crop area manually.

The selected bead grid dimensions determine the output aspect ratio. Preset sizes default to square bead-board sizes. Custom sizes may be non-square.

The crop result is the input for pixel conversion.

### 6.3 Pixel Conversion

The app converts the cropped image into a target grid.

The default conversion should prioritize bead-making practicality over maximum photo similarity. This means reducing noise, limiting unstable near-duplicate colors, and producing clear color blocks.

Advanced settings may let users increase color count to preserve more detail.

The first version uses traditional image processing only. It does not use AI style transfer.

### 6.4 Color Control

The app provides three color modes:

- Simple.
- Standard.
- Detailed.

The exact color counts can be defined during implementation, but the modes should represent increasing detail and increasing complexity.

Advanced settings must allow a custom color count.

The first version uses a general-purpose palette. The palette data model should allow future brand-specific palettes.

### 6.5 Color Statistics

The app must show color statistics for the converted pattern.

Each color row should include:

- A color swatch.
- HEX value.
- Bead count.

The first version should not show color names, brand names, or brand color codes.

### 6.6 PNG Export

The app must export a high-resolution PNG.

The exported image must include:

- The bead pattern.
- Clear grid lines.
- Enlarged cells suitable for phone or desktop viewing.

The export flow must let users choose whether to include color statistics in the same PNG.

## 7. Interaction Requirements

The default workflow should be understandable without image-processing knowledge.

Primary actions should be clear at each step:

- Upload.
- Confirm crop.
- Generate or update preview.
- Export.

Advanced settings should stay collapsed by default.

The preview editor must support toggling between the original crop and the converted result.

The app should not display work difficulty estimates in the first version. Preset names can communicate relative detail level, but no extra difficulty explanation is required.

## 8. Error Handling Requirements

The app should handle at least these cases:

- Unsupported file format.
- File read failure.
- Image load failure.
- Image too large or processing failure.
- User attempts conversion before uploading an image.
- Invalid crop area.
- Invalid custom width or height.
- Invalid custom color count.
- Missing browser API required for processing or export.
- Export failure.

Error messages should explain what happened and what the user can do next.

## 9. Acceptance Criteria

The first phase is complete when:

1. A user can open the web app on mobile or desktop.
2. A user can upload a JPG, PNG, or WebP image.
3. The uploaded image is processed locally in the browser.
4. A user can manually crop the image.
5. A user can choose a bead-board preset such as 29x29, 58x58, or 87x87.
6. A user can enter a custom grid size.
7. Custom grid size supports non-square dimensions.
8. A user can choose simple, standard, or detailed color mode.
9. A user can set a custom color count through advanced settings.
10. The conversion result prioritizes bead-making practicality by default.
11. A user can toggle between the original crop and converted result.
12. The color statistics show swatch, HEX value, and bead count.
13. A user can export a high-resolution PNG with grid lines.
14. A user can choose whether the exported PNG includes color statistics.
15. The interface supports Chinese and English.
16. The main workflow is usable on both mobile and desktop.
17. Common error cases show clear user-facing messages.

## 10. Future Expansion

Future versions may add:

- Real bead brand palettes.
- Brand color codes.
- Color-number legends.
- PDF pattern sheets.
- Material list improvements.
- Project files.
- Local draft saving.
- AI-enhanced conversion.
- Face-aware cropping.
- Background removal.
- Server-side high-quality processing.
