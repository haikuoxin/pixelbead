import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getCopy } from "../../lib/pixelbead/copy";
import type { BeadPattern } from "../../lib/pixelbead/types";
import { PreviewEditor } from "./PreviewEditor";

vi.mock("./PatternCanvas", () => ({
  PatternCanvas: () => <div data-testid="pattern-canvas" />,
}));

vi.mock("../../lib/pixelbead/export-png", () => ({
  downloadPatternPng: vi.fn(() => {
    throw Object.assign(new Error("export_failed"), { code: "export_failed" });
  }),
}));

const pattern: BeadPattern = {
  width: 1,
  height: 1,
  cells: [{ x: 0, y: 0, color: { r: 0, g: 0, b: 0, hex: "#000000" } }],
  stats: [{ color: { r: 0, g: 0, b: 0, hex: "#000000" }, count: 1 }],
};

describe("PreviewEditor", () => {
  it("shows an inline error when PNG export fails", async () => {
    render(<PreviewEditor copy={getCopy("zh")} language="zh" pattern={pattern} originalUrl="blob:crop" grid={{ width: 1, height: 1 }} />);

    fireEvent.click(screen.getByRole("button", { name: "导出 PNG" }));

    expect(screen.getByText("导出失败，请重试。")).toBeVisible();
  });
});
