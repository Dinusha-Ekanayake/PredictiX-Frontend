/**
 * What the asset panel says about the scheduled service versus the AI's view.
 *
 * Two models feed this: the classifier's failure probability and the
 * regressor's predicted maintenance date. Comparing the predicted date with
 * the schedule on its own produced "Asset may last 90 days beyond scheduled
 * service" on forklifts with a 100% failure risk, because their scheduled
 * service was months overdue. Advice that reads as "you can defer this" must
 * never appear on an asset the classifier says is likely to fail, and an
 * overdue service is reported as overdue, not compared with anything.
 */

/** Failure probability at or above which an asset counts as likely to fail.
 *  Matches the backend's "predicted failures" KPI (failure_probability >= 0.5). */
export const HIGH_RISK_PROBABILITY = 0.5;

const DAY_MS = 86_400_000;

export type ServiceTimingTone = "critical" | "warning" | "ok";

export interface ServiceTiming {
  tone: ServiceTimingTone;
  text: string;
}

export interface ServiceTimingInput {
  /** Asset's scheduled service date (ISO date), if it has one. */
  nextServiceDate: string | null | undefined;
  /** AI-predicted maintenance date (ISO date), if the model gave one. */
  predictedDate: string | null | undefined;
  /** Classifier failure probability, 0..1. */
  failureProbability: number;
  /** Injected for tests; defaults to the current time. */
  now?: Date;
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / DAY_MS);
}

function plural(n: number): string {
  return `${n} day${n === 1 ? "" : "s"}`;
}

export function serviceTiming({
  nextServiceDate,
  predictedDate,
  failureProbability,
  now = new Date(),
}: ServiceTimingInput): ServiceTiming | null {
  if (!nextServiceDate) return null;
  const scheduled = new Date(nextServiceDate);
  if (Number.isNaN(scheduled.getTime())) return null;

  const daysToSchedule = daysBetween(now, scheduled);
  if (daysToSchedule < 0) {
    return { tone: "critical", text: `Scheduled service is overdue by ${plural(-daysToSchedule)}` };
  }

  const highRisk = failureProbability >= HIGH_RISK_PROBABILITY;
  const predicted = predictedDate ? new Date(predictedDate) : null;
  if (!predicted || Number.isNaN(predicted.getTime())) {
    return highRisk
      ? { tone: "critical", text: "High failure risk: keep the scheduled service or bring it forward" }
      : null;
  }

  const diff = daysBetween(scheduled, predicted);
  if (diff < 0) {
    return { tone: "critical", text: `AI predicts failure ${plural(-diff)} before scheduled service` };
  }
  if (highRisk) {
    return { tone: "critical", text: "High failure risk: keep the scheduled service or bring it forward" };
  }
  if (diff > 0) {
    return { tone: "warning", text: `Asset may last ${plural(diff)} beyond scheduled service` };
  }
  return { tone: "ok", text: "AI prediction aligns with schedule" };
}
