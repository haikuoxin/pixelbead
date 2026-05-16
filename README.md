# PixelBead

PixelBead is a tool for turning ordinary photos into pixel-art or bead-pattern references for pixel bead projects.

很多人会用自拍、明星照片、宠物照或手机相册里的图片来拼豆，但原图通常不是像素风，也没有清晰的点阵参考。PixelBead 的目标是把这些图片转换成适合照着拼的点阵图案，帮助用户降低颜色混乱、边缘不清和尺寸失控的问题。

## Goal

Build an image-to-pattern workflow for pixel bead creators:

1. Upload or import a source image.
2. Crop and choose the target bead board size.
3. Convert the image into a pixel grid.
4. Reduce colors into a practical bead palette.
5. Preview the final pattern with grid lines and color labels.
6. Export the pattern for making the physical bead artwork.

## MVP Scope

- Image upload from local device.
- Crop and resize to a fixed grid size.
- Pixelation preview.
- Limited color quantization.
- Grid overlay for bead placement.
- Export as PNG.

## Future Ideas

- Map colors to real bead brands and color codes.
- Generate a material list with bead counts per color.
- Support transparent backgrounds and portrait cutouts.
- Add face-aware cropping for selfies and celebrity photos.
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
