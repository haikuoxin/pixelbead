import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PatternCanvas } from "./PatternCanvas";

vi.mock("../../lib/pixelbead/export-png", () => ({
  renderPatternToCanvas: vi.fn(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 40;
    return canvas;
  }),
}));

describe("PatternCanvas subject cells", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

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
