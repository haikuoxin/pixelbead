import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelBeadApp } from "./PixelBeadApp";

describe("PixelBeadApp", () => {
  it("renders the upload step in Chinese by default", () => {
    render(<PixelBeadApp />);
    expect(screen.getByRole("heading", { name: "PixelBead" })).toBeVisible();
    expect(screen.getByLabelText("上传图片")).toBeVisible();
    expect(screen.getByText("支持 JPG、PNG、WebP")).toBeVisible();
  });
});
