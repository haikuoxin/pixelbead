import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelBeadApp } from "./PixelBeadApp";

describe("PixelBeadApp", () => {
  it("renders the upload step in Chinese by default", () => {
    render(<PixelBeadApp />);
    expect(screen.getByRole("heading", { name: "PixelBead" })).toBeVisible();
    expect(screen.getByLabelText("上传图片")).toBeVisible();
    expect(screen.getByText("支持 JPG、PNG、WebP")).toBeVisible();
  });

  it("switches upload copy to English", () => {
    render(<PixelBeadApp />);
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByLabelText("Upload image")).toBeVisible();
    expect(screen.getByText("Supports JPG, PNG, and WebP")).toBeVisible();
  });

  it("shows a localized unsupported-format error", () => {
    render(<PixelBeadApp />);
    const input = screen.getByLabelText("上传图片");

    fireEvent.change(input, { target: { files: [new File(["x"], "photo.gif", { type: "image/gif" })] } });

    expect(screen.getByText("不支持这种图片格式。请上传 JPG、PNG 或 WebP。")).toBeVisible();
  });
});
