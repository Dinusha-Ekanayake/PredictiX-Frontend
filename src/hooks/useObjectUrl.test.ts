import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useObjectUrl } from "./useObjectUrl";

describe("useObjectUrl", () => {
  let counter = 0;
  const create = vi.fn(() => `blob:preview-${++counter}`);
  const revoke = vi.fn();

  beforeEach(() => {
    counter = 0;
    create.mockClear();
    revoke.mockClear();
    vi.stubGlobal("URL", { ...URL, createObjectURL: create, revokeObjectURL: revoke });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when there is no file", () => {
    const { result } = renderHook(() => useObjectUrl(null));
    expect(result.current).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("creates one URL per file, not one per render", () => {
    const file = new Blob(["x"]);
    const { result, rerender } = renderHook(({ f }) => useObjectUrl(f), { initialProps: { f: file } });
    rerender({ f: file });
    rerender({ f: file });
    expect(create).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("blob:preview-1");
  });

  it("releases the old URL when the file changes and on unmount", () => {
    const { rerender, unmount } = renderHook(({ f }) => useObjectUrl(f), {
      initialProps: { f: new Blob(["a"]) as Blob | null },
    });
    rerender({ f: new Blob(["b"]) });
    expect(revoke).toHaveBeenCalledWith("blob:preview-1");
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:preview-2");
  });
});
