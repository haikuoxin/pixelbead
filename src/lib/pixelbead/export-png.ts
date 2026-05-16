import type { BeadPattern, ColorStat, GridSize } from "./types";
import { codedError } from "./coded-error";

const cellSize = 40;
const statsWidth = 360;
const statsTop = 76;
const statsRowHeight = 30;
const statsBottomPadding = 24;

export function calculateExportSize(grid: GridSize, includeStats: boolean, statsCount = 0) {
  const statsHeight = includeStats ? Math.max(120, statsTop + statsCount * statsRowHeight + statsBottomPadding) : 0;

  return {
    width: grid.width * cellSize + (includeStats ? statsWidth : 0),
    height: Math.max(grid.height * cellSize, statsHeight),
  };
}

function drawStats(context: CanvasRenderingContext2D, stats: ColorStat[], startX: number) {
  context.fillStyle = "#ffffff";
  context.fillRect(startX, 0, statsWidth, context.canvas.height);
  context.fillStyle = "#111827";
  context.font = "20px sans-serif";
  context.fillText("Color counts", startX + 24, 40);

  stats.forEach((stat, index) => {
    const y = statsTop + index * statsRowHeight;
    context.fillStyle = stat.color.hex;
    context.fillRect(startX + 24, y - 16, 18, 18);
    context.strokeStyle = "#111827";
    context.strokeRect(startX + 24, y - 16, 18, 18);
    context.fillStyle = "#111827";
    context.fillText(`${stat.color.hex}  ${stat.count}`, startX + 56, y);
  });
}

export function renderPatternToCanvas(pattern: BeadPattern, includeStats: boolean): HTMLCanvasElement {
  const size = calculateExportSize(pattern, includeStats, pattern.stats.length);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw codedError("export_failed");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const cell of pattern.cells) {
    context.fillStyle = cell.kind === "empty" ? "#ffffff" : cell.color.hex;
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

  if (includeStats) {
    drawStats(context, pattern.stats, pattern.width * cellSize);
  }

  return canvas;
}

export function downloadPatternPng(pattern: BeadPattern, includeStats: boolean) {
  const canvas = renderPatternToCanvas(pattern, includeStats);
  const link = document.createElement("a");
  link.download = "pixelbead-pattern.png";
  try {
    link.href = canvas.toDataURL("image/png");
  } catch {
    throw codedError("export_failed");
  }

  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    document.body.removeChild(link);
  }
}
