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
  let minR = Number.POSITIVE_INFINITY;
  let minG = Number.POSITIVE_INFINITY;
  let minB = Number.POSITIVE_INFINITY;
  let maxR = Number.NEGATIVE_INFINITY;
  let maxG = Number.NEGATIVE_INFINITY;
  let maxB = Number.NEGATIVE_INFINITY;

  for (const color of colors) {
    minR = Math.min(minR, color.r);
    minG = Math.min(minG, color.g);
    minB = Math.min(minB, color.b);
    maxR = Math.max(maxR, color.r);
    maxG = Math.max(maxG, color.g);
    maxB = Math.max(maxB, color.b);
  }

  const channelRanges = {
    r: maxR - minR,
    g: maxG - minG,
    b: maxB - minB,
  };

  return Object.entries(channelRanges).sort((a, b) => b[1] - a[1])[0][0] as keyof RgbColor;
}

export function quantizeColors(colors: RgbColor[], targetCount: number): RgbColor[] {
  if (targetCount <= 0) return [];
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
      const candidateDistance =
        (input.r - candidate.r) ** 2 + (input.g - candidate.g) ** 2 + (input.b - candidate.b) ** 2;

      return candidateDistance < bestDistance ? candidate : best;
    }, palette[0]),
  );
}
