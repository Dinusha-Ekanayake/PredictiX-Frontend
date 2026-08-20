import { test, expect } from "vitest";
import {
  bandFor,
  healthColor,
  healthTextClass,
  healthBadgeClass,
  formatHealth,
  HEALTH_GOOD,
  HEALTH_POOR,
} from "@/lib/healthBands";

// Health bands decide the colour and label shown for an asset's condition.
// Every screen must band a score the same way, so these pin the exact rules.

test("a score of 100 is banded as excellent", () => {
  expect(bandFor(100)).toBe("excellent");
});

test("a score of 79, the highest the fleet produces, is banded as excellent", () => {
  expect(bandFor(79)).toBe("excellent");
});

test("a score of exactly 60 is excellent, because the boundary is inclusive", () => {
  expect(bandFor(60)).toBe("excellent");
});

test("a score just below 60 drops to good", () => {
  expect(bandFor(59.99)).toBe("good");
});

test("a score of exactly 50 is good", () => {
  expect(bandFor(50)).toBe("good");
});

test("a score just below 50 drops to moderate", () => {
  expect(bandFor(49.99)).toBe("moderate");
});

test("a score of exactly 38 is moderate", () => {
  expect(bandFor(38)).toBe("moderate");
});

test("a score just below 38 drops to poor", () => {
  expect(bandFor(37.99)).toBe("poor");
});

test("a score of exactly 25 is poor", () => {
  expect(bandFor(25)).toBe("poor");
});

test("a score just below 25 drops to critical", () => {
  expect(bandFor(24.99)).toBe("critical");
});

test("a score of zero is banded as critical", () => {
  expect(bandFor(0)).toBe("critical");
});

test("an asset with no score has no band, rather than a bad one", () => {
  expect(bandFor(null)).toBeNull();
});

test("an undefined score has no band", () => {
  expect(bandFor(undefined)).toBeNull();
});

test("a NaN score has no band", () => {
  expect(bandFor(NaN)).toBeNull();
});

test("all five bands can actually occur on real scores, none is unreachable", () => {
  const seen = new Set<string | null>();
  for (let score = 0; score <= 79; score += 1) seen.add(bandFor(score));
  expect([...seen].sort()).toEqual(["critical", "excellent", "good", "moderate", "poor"]);
});

test("a healthy score is coloured green", () => {
  expect(healthColor(70)).toBe("#10b981");
});

test("a mid-range score is coloured amber", () => {
  expect(healthColor(45)).toBe("#f59e0b");
});

test("a low score is coloured red", () => {
  expect(healthColor(20)).toBe("#ef4444");
});

test("a missing score is coloured grey, never a misleading green", () => {
  expect(healthColor(null)).toBe("#94a3b8");
});

test("the colour changes exactly at the good boundary", () => {
  expect(healthColor(HEALTH_GOOD)).not.toBe(healthColor(HEALTH_GOOD - 0.01));
});

test("the colour changes exactly at the poor boundary", () => {
  expect(healthColor(HEALTH_POOR)).not.toBe(healthColor(HEALTH_POOR - 0.01));
});

test("a missing score uses muted text, not a health colour", () => {
  expect(healthTextClass(null)).toContain("slate");
});

test("a missing score uses a muted badge, not a health colour", () => {
  expect(healthBadgeClass(null)).toContain("slate");
});

test("a score is displayed as a rounded percentage", () => {
  expect(formatHealth(72.4)).toBe("72%");
});

test("a missing score is displayed as a dash, not as zero", () => {
  expect(formatHealth(null)).toBe("—");
});

test("a genuine zero score is displayed as 0%, not as a dash", () => {
  expect(formatHealth(0)).toBe("0%");
});
