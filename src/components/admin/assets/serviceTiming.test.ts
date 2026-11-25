import { describe, expect, test } from "vitest";

import { HIGH_RISK_PROBABILITY, serviceTiming } from "./serviceTiming";

const NOW = new Date("2026-11-25T00:00:00Z");

describe("serviceTiming", () => {
  test("an overdue service is reported as overdue, whatever the model says", () => {
    // The real case: scheduled 24 Aug, predicted 22 Nov, failure risk 99.7%.
    const t = serviceTiming({
      nextServiceDate: "2026-08-24", predictedDate: "2026-11-22",
      failureProbability: 0.9974, now: NOW,
    });
    expect(t).toEqual({ tone: "critical", text: "Scheduled service is overdue by 93 days" });
  });

  test("a likely-to-fail asset is never told it may outlast its schedule", () => {
    const t = serviceTiming({
      nextServiceDate: "2026-12-01", predictedDate: "2027-03-01",
      failureProbability: HIGH_RISK_PROBABILITY, now: NOW,
    });
    expect(t?.tone).toBe("critical");
    expect(t?.text).not.toMatch(/may last/i);
  });

  test("a low-risk asset whose predicted date is later may outlast its schedule", () => {
    const t = serviceTiming({
      nextServiceDate: "2026-12-01", predictedDate: "2026-12-31",
      failureProbability: 0.1, now: NOW,
    });
    expect(t).toEqual({ tone: "warning", text: "Asset may last 30 days beyond scheduled service" });
  });

  test("an earlier predicted date warns before the schedule", () => {
    const t = serviceTiming({
      nextServiceDate: "2026-12-31", predictedDate: "2026-12-30",
      failureProbability: 0.2, now: NOW,
    });
    expect(t).toEqual({ tone: "critical", text: "AI predicts failure 1 day before scheduled service" });
  });

  test("matching dates agree with the schedule", () => {
    const t = serviceTiming({
      nextServiceDate: "2026-12-10", predictedDate: "2026-12-10",
      failureProbability: 0.1, now: NOW,
    });
    expect(t?.tone).toBe("ok");
  });

  test("no schedule, or an unreadable one, gives no message", () => {
    expect(serviceTiming({ nextServiceDate: null, predictedDate: "2026-12-10", failureProbability: 0.9, now: NOW })).toBeNull();
    expect(serviceTiming({ nextServiceDate: "not a date", predictedDate: null, failureProbability: 0.9, now: NOW })).toBeNull();
  });

  test("high risk with no predicted date still says to keep the service", () => {
    const t = serviceTiming({ nextServiceDate: "2026-12-10", predictedDate: null, failureProbability: 0.8, now: NOW });
    expect(t?.tone).toBe("critical");
  });
});
