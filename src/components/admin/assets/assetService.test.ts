import { test, expect } from "vitest";
import { deriveHealthScore, deriveFailureProbability } from "@/components/admin/assets/assetService";
import type { BatchPrediction } from "@/components/admin/assets/types";

// These two helpers decide what the asset panel shows. The rule they enforce
// is that a number only ever appears when a model actually produced one.

function prediction(fields: Partial<BatchPrediction>): BatchPrediction {
  return { ...fields } as BatchPrediction;
}

test("the health score shown is the one the model produced", () => {
  expect(deriveHealthScore(prediction({ health_score: 41.4 }))).toBe(41);
});

test("a model health score is rounded to a whole number", () => {
  expect(deriveHealthScore(prediction({ health_score: 72.6 }))).toBe(73);
});

test("an asset with no prediction has no health score, rather than an invented one", () => {
  expect(deriveHealthScore(null)).toBeNull();
});

test("a prediction that exists but was never scored has no health score", () => {
  expect(deriveHealthScore(prediction({ health_score: null }))).toBeNull();
});

test("a genuine health score of zero is kept, not treated as missing", () => {
  expect(deriveHealthScore(prediction({ health_score: 0 }))).toBe(0);
});

test("the failure probability shown is the one the model produced", () => {
  expect(deriveFailureProbability(prediction({ failure_probability: 0.42 }))).toBe(0.42);
});

test("an asset with no prediction reports zero failure probability", () => {
  expect(deriveFailureProbability(null)).toBe(0);
});

test("a prediction with no failure probability reports zero", () => {
  expect(deriveFailureProbability(prediction({ failure_probability: null }))).toBe(0);
});
