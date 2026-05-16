import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateExportSize, downloadPatternPng } from "./export-png";
import type { BeadPattern, ColorStat } from "./types";

function pattern(stats: ColorStat[] = []): BeadPattern {
  return {
    width: 1,
    height: 1,
    cells: [
      {
        x: 0,
        y: 0,
        color: { r: 255, g: 0, b: 0, hex: "#ff0000" },
      },
    ],
    stats,
  };
}

function mockExportCanvas(toDataURL = vi.fn(() => "data:image/png;base64,pixelbead")) {
  const originalCreateElement = document.createElement.bind(document);
  const canvasContext = {
    beginPath: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => canvasContext),
    toDataURL,
  };

  vi.spyOn(document, "createElement").mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
    if (tagName === "canvas") {
      return canvas as unknown as HTMLElement;
    }

    return originalCreateElement(tagName, options);
  }) as typeof document.createElement);

  return { canvas, toDataURL };
}

describe("calculateExportSize", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scales small grids into high-resolution exports", () => {
    expect(calculateExportSize({ width: 29, height: 29 }, false)).toEqual({ width: 1160, height: 1160 });
  });

  it("adds width when color statistics are included", () => {
    expect(calculateExportSize({ width: 29, height: 29 }, true).width).toBeGreaterThan(1160);
  });

  it("grows stats exports tall enough for many color rows on small grids", () => {
    expect(calculateExportSize({ width: 1, height: 1 }, true, 20).height).toBeGreaterThanOrEqual(76 + 20 * 30 + 24);
  });
});

describe("downloadPatternPng", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("sets the filename and data URL, clicks the link, and removes it", () => {
    mockExportCanvas();
    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    downloadPatternPng(pattern(), false);

    expect(appendChild).toHaveBeenCalledOnce();
    const link = appendChild.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.download).toBe("pixelbead-pattern.png");
    expect(link.href).toBe("data:image/png;base64,pixelbead");
    expect(click).toHaveBeenCalledOnce();
    expect(removeChild).toHaveBeenCalledWith(link);
    expect(document.body.contains(link)).toBe(false);
  });

  it("wraps toDataURL failures as export_failed errors", () => {
    const toDataURL = vi.fn(() => {
      throw new DOMException("canvas export failed");
    });
    mockExportCanvas(toDataURL);

    expect(() => downloadPatternPng(pattern(), false)).toThrow(expect.objectContaining({ code: "export_failed" }));
  });
});
