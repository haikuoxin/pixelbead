import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadImageFromFile } from "./image-loading";

type ImageLoadResult = "success" | "failure";

let imageLoadResult: ImageLoadResult;
let createObjectURL: ReturnType<typeof vi.fn<[File], string>>;
let revokeObjectURL: ReturnType<typeof vi.fn<[string], void>>;

class MockImage {
  static lastInstance: MockImage | undefined;

  decoding: "async" | "auto" | "sync" = "auto";
  naturalWidth = 42;
  naturalHeight = 24;
  onload: ((ev: Event) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;
  #src = "";

  get src() {
    return this.#src;
  }

  set src(value: string) {
    this.#src = value;
    MockImage.lastInstance = this;
    queueMicrotask(() => {
      if (imageLoadResult === "success") {
        this.onload?.(new Event("load"));
      } else {
        this.onerror?.(new Event("error"));
      }
    });
  }
}

function file() {
  return new File(["x"], "photo.png", { type: "image/png" });
}

describe("loadImageFromFile", () => {
  beforeEach(() => {
    imageLoadResult = "success";
    MockImage.lastInstance = undefined;
    createObjectURL = vi.fn(() => "blob:pixelbead-test");
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.stubGlobal("Image", MockImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads an image from an object URL and leaves revocation to the caller", async () => {
    const sourceFile = file();

    const loaded = await loadImageFromFile(sourceFile);

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledWith(sourceFile);
    expect(loaded.url).toBe("blob:pixelbead-test");
    expect(loaded.element).toBe(MockImage.lastInstance);
    expect(loaded.width).toBe(42);
    expect(loaded.height).toBe(24);
    expect(loaded.element.onload).toBeNull();
    expect(loaded.element.onerror).toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();

    loaded.revoke();

    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:pixelbead-test");
  });

  it("revokes the object URL and throws a coded error when loading fails", async () => {
    imageLoadResult = "failure";

    await expect(loadImageFromFile(file())).rejects.toMatchObject({
      code: "image_load_failed",
    });

    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:pixelbead-test");
    expect(MockImage.lastInstance?.onload).toBeNull();
    expect(MockImage.lastInstance?.onerror).toBeNull();
  });
});
