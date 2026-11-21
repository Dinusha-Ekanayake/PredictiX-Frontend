import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import {
  ATTACHMENT_ACCEPT,
  MAX_ATTACHMENT_BYTES,
  attachmentObjectName,
  attachmentProblem,
} from "./attachments";
import { getAccessToken, isAuthenticated, tokenExpiry } from "./authService";

function fileOf(type: string, size = 1024, name = "photo"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function jwtWithExp(exp: number): string {
  const payload = btoa(JSON.stringify({ sub: "u", exp }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${payload}.signature`;
}

describe("ticket attachments", () => {
  it("accepts common image types under the size limit", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(attachmentProblem(fileOf(type))).toBeNull();
    }
  });

  it("rejects SVG, HTML and other non-image types", () => {
    for (const type of ["image/svg+xml", "text/html", "application/pdf", ""]) {
      expect(attachmentProblem(fileOf(type))).not.toBeNull();
    }
  });

  it("rejects files over the size limit", () => {
    expect(attachmentProblem(fileOf("image/png", MAX_ATTACHMENT_BYTES + 1))).not.toBeNull();
  });

  it("names the stored object from the file type, not the file name", () => {
    const name = attachmentObjectName(fileOf("image/png", 10, "evil.html"), "abc");
    expect(name).toMatch(/^\d+-abc\.png$/);
  });

  it("offers only the accepted types to the file picker", () => {
    expect(ATTACHMENT_ACCEPT).not.toContain("svg");
    expect(ATTACHMENT_ACCEPT).toContain("image/png");
  });
});

describe("session expiry", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it("reads the expiry claim from a JWT", () => {
    expect(tokenExpiry(jwtWithExp(1700000000))).toBe(1700000000);
    expect(tokenExpiry("not-a-jwt")).toBeNull();
  });

  it("treats an unexpired token as signed in", () => {
    localStorage.setItem("predictix.access_token", jwtWithExp(Math.floor(Date.now() / 1000) + 3600));
    expect(isAuthenticated()).toBe(true);
  });

  it("clears an expired session and reports signed out", () => {
    localStorage.setItem("predictix.access_token", jwtWithExp(Math.floor(Date.now() / 1000) - 60));
    expect(isAuthenticated()).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
