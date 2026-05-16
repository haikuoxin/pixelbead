import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PixelBeadApp } from "./PixelBeadApp";

vi.mock("./UploadStep", () => ({
  UploadStep: ({ onImageLoaded }: { onImageLoaded: (loaded: { element: HTMLImageElement; url: string; revoke: () => void }) => void }) => (
    <button
      type="button"
      onClick={() => {
        const image = document.createElement("img");
        Object.defineProperty(image, "naturalWidth", { value: 100 });
        Object.defineProperty(image, "naturalHeight", { value: 100 });
        onImageLoaded({ element: image, url: "blob:image", revoke: vi.fn() });
      }}
    >
      mock upload
    </button>
  ),
}));

vi.mock("./CropStep", () => ({
  CropStep: (props: { conversionMode: string; backgroundTreatment: string; isSubjectProcessing: boolean }) => (
    <div
      data-testid="crop-step"
      data-mode={props.conversionMode}
      data-background={props.backgroundTreatment}
      data-processing={String(props.isSubjectProcessing)}
    />
  ),
}));

describe("PixelBeadApp subject workflow state", () => {
  it("passes subject-first defaults to the crop step", () => {
    render(<PixelBeadApp />);

    fireEvent.click(screen.getByRole("button", { name: "mock upload" }));

    expect(screen.getByTestId("crop-step")).toHaveAttribute("data-mode", "subject");
    expect(screen.getByTestId("crop-step")).toHaveAttribute("data-background", "empty");
    expect(screen.getByTestId("crop-step")).toHaveAttribute("data-processing", "false");
  });
});
