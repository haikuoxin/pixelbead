import { describe, expect, it, vi } from "vitest";
import { replaceRevokeCallback, revokeCurrentCallback } from "./object-url-lifecycle";

describe("object URL lifecycle helpers", () => {
  it("revokes the current callback before replacing it", () => {
    const first = vi.fn();
    const second = vi.fn();
    const ref = { current: first };

    replaceRevokeCallback(ref, second);

    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    expect(ref.current).toBe(second);
  });

  it("revokes and clears the current callback", () => {
    const revoke = vi.fn();
    const ref = { current: revoke };

    revokeCurrentCallback(ref);

    expect(revoke).toHaveBeenCalledOnce();
    expect(ref.current).toBeNull();
  });
});
