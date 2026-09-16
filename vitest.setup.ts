import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom does not implement matchMedia. Anything that reads the system colour
// scheme throws without this, which takes down the whole file rather than one
// test. Defaults to light so a component under test sees a definite answer.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),      // deprecated, still called by some libraries
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Unmount anything a test rendered, so one test cannot affect the next.
afterEach(() => {
  cleanup();
});
