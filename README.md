# PixelBead

PixelBead is a tool for turning ordinary photos into pixel-art or bead-pattern references for pixel bead projects.

很多人会用自拍、明星照片、宠物照或手机相册里的图片来拼豆，但原图通常不是像素风，也没有清晰的点阵参考。PixelBead 的目标是把这些图片转换成适合照着拼的点阵图案，帮助用户降低颜色混乱、边缘不清和尺寸失控的问题。

## Goal

Build an image-to-pattern workflow for pixel bead creators:

1. Upload or import a source image.
2. Crop and choose the target bead board size.
3. Convert the image into a pixel grid.
4. Segment the main subject by default and remove visual noise from the background.
5. Reduce colors into a practical bead palette.
6. Preview the final pattern with grid lines and color labels.
7. Export the pattern for making the physical bead artwork.

## MVP Scope

- Image upload from local device.
- Crop and resize to a fixed grid size.
- Pixelation preview.
- Subject-first conversion mode for people, toys, pets, vehicles, characters, and other clear image subjects.
- Whole-image conversion mode for scenes or images where the background should remain part of the pattern.
- Limited color quantization with subject-mode color presets.
- Grid overlay for bead placement.
- Empty, white, or light-gray background treatment for removed background cells.
- Export as PNG.

## Subject-First Conversion

The default conversion mode focuses on the main subject instead of flattening the whole photo into a bead grid. This is important for phone photos where shelves, desks, walls, and other background details can dominate the color palette and make the pattern unreadable.

The current workflow is:

1. Upload an image.
2. Crop around the object that should become the bead pattern.
3. Keep the default `Subject first` mode, or switch to `Whole image` when the full scene matters.
4. Choose how removed background cells should appear: empty, white, or light gray.
5. Confirm the crop and review the grid, color counts, and warnings.

Subject segmentation runs in the browser with an open-source local model package. Images are not sent to a paid external API.

## Future Ideas

- Map colors to real bead brands and color codes.
- Generate a material list with bead counts per color.
- Map transparent exports to bead-board templates.
- Add smarter subject-aware crop suggestions.
- Export PDF instructions.
- Save and reopen projects.
- Mobile-first workflow for phone users.

## Development Notes

The first implementation is a Next.js web app with browser-local image processing. Keep the prototype focused on local upload, crop, conversion, preview, and PNG export before introducing accounts, cloud storage, or paid APIs.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

Install the Playwright browser once before running end-to-end tests:

```bash
npm run e2e:install
```

Run the standard checks:

```bash
npm run test
npm run build
npm run e2e
```

## Repository Status

- `README.md`: project purpose and initial scope.
- `.gitignore`: common local, dependency, build, and environment files.
