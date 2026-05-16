export type RevokeCallbackRef = {
  current: (() => void) | null;
};

export function replaceRevokeCallback(ref: RevokeCallbackRef, next: () => void) {
  ref.current?.();
  ref.current = next;
}

export function revokeCurrentCallback(ref: RevokeCallbackRef) {
  ref.current?.();
  ref.current = null;
}
