import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getCopy } from "../../lib/pixelbead/copy";
import { CropStep } from "./CropStep";

vi.mock("react-image-crop", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  centerCrop: (crop: unknown) => crop,
  makeAspectCrop: (crop: unknown) => crop,
}));

function imageElement() {
  const image = document.createElement("img");
  Object.defineProperty(image, "naturalWidth", { value: 100 });
  Object.defineProperty(image, "naturalHeight", { value: 100 });
  return image;
}

describe("CropStep subject controls", () => {
  it("selects subject-first mode by default", () => {
    render(
      <CropStep
        copy={getCopy("zh")}
        image={imageElement()}
        imageUrl="blob:image"
        language="zh"
        grid={{ width: 58, height: 58 }}
        onGridChange={vi.fn()}
        onPatternReady={vi.fn()}
        defaultColorCount={8}
        conversionMode="subject"
        onConversionModeChange={vi.fn()}
        backgroundTreatment="empty"
        onBackgroundTreatmentChange={vi.fn()}
        onSubjectWarningsChange={vi.fn()}
        onSubjectProcessingChange={vi.fn()}
        isSubjectProcessing={false}
      />,
    );

    expect(screen.getByRole("button", { name: "主体优先" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "不铺豆" })).toHaveAttribute("aria-pressed", "true");
  });
});
