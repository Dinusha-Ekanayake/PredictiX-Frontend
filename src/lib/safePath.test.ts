import { describe, expect, it } from "vitest";

import { isInAppPath, isSafeActionButton } from "./safePath";

describe("isInAppPath", () => {
  it.each(["/", "/admin/tickets", "/admin/assets?asset_id=1", "/user/dashboard#top"])(
    "accepts the same-site path %s",
    (path) => {
      expect(isInAppPath(path)).toBe(true);
    },
  );

  it.each([
    ["protocol-relative", "//evil.example"],
    ["absolute https", "https://evil.example/x"],
    ["javascript scheme", "javascript:alert(1)"],
    ["data scheme", "data:text/html,<script>"],
    ["backslash trick", "/\\evil.example"],
    ["embedded space", "/admin tickets"],
    ["relative path", "admin/tickets"],
    ["empty", ""],
  ])("rejects a %s link", (_name, path) => {
    expect(isInAppPath(path)).toBe(false);
  });

  it("rejects values that are not strings", () => {
    expect(isInAppPath(undefined)).toBe(false);
    expect(isInAppPath(null)).toBe(false);
    expect(isInAppPath(42)).toBe(false);
    expect(isInAppPath({ path: "/admin" })).toBe(false);
  });
});

describe("isSafeActionButton", () => {
  it("accepts an in-app navigation button", () => {
    expect(isSafeActionButton({ label: "Open ticket", path: "/admin/tickets?id=7" })).toBe(true);
  });

  it("accepts a copy action with a bounded value", () => {
    expect(isSafeActionButton({ label: "Copy id", path: "copy:TCK-0042" })).toBe(true);
  });

  it.each([
    ["external link", { label: "Docs", path: "https://evil.example" }],
    ["script link", { label: "Run", path: "javascript:alert(1)" }],
    ["blank label", { label: "   ", path: "/admin" }],
    ["missing label", { path: "/admin" }],
    ["non-string path", { label: "x", path: 5 }],
    ["empty copy", { label: "Copy", path: "copy:" }],
    ["copy with spaces", { label: "Copy", path: "copy:a b" }],
    ["oversized copy", { label: "Copy", path: `copy:${"a".repeat(201)}` }],
  ])("rejects a button with %s", (_name, btn) => {
    expect(isSafeActionButton(btn)).toBe(false);
  });

  it("rejects null and primitive values", () => {
    expect(isSafeActionButton(null)).toBe(false);
    expect(isSafeActionButton("/admin")).toBe(false);
  });
});
