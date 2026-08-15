/**
 * Health bands and the colours the UI draws them in.
 *
 * Bands, best to worst: excellent >= 60, good >= 50, moderate >= 38,
 * poor >= 25, critical below that.
 *
 * These match `app/services/health_bands.py` and the `asset_health_band`
 * Postgres enum. The backend is the source of truth, so change them there
 * first. Import from here rather than writing thresholds inline, so every
 * screen bands a score the same way.
 *
 * Scores come from `pdm_batch_predictions.health_score`, which is the mean of
 * the component health readings minus a penalty for failure probability and
 * urgency. It reaches about 79 at best, so a cut-off above that never matches.
 */

export const HEALTH_BAND_THRESHOLDS = [
  ["excellent", 60],
  ["good", 50],
  ["moderate", 38],
  ["poor", 25],
] as const;

export type HealthBand = "excellent" | "good" | "moderate" | "poor" | "critical";

/** Lower bound of the "good or better" range. */
export const HEALTH_GOOD = 50;
/** Below this an asset is poor or critical. */
export const HEALTH_POOR = 38;

/**
 * Band a health score. Null in, null out: an asset with no prediction has no
 * band, which is different from having a bad one.
 */
export function bandFor(score: number | null | undefined): HealthBand | null {
  if (score == null || Number.isNaN(score)) return null;
  for (const [name, lower] of HEALTH_BAND_THRESHOLDS) {
    if (score >= lower) return name;
  }
  return "critical";
}

/** Hex colour for a score, matching the dashboard's bar palette. */
export function healthColor(score: number | null | undefined): string {
  if (score == null) return "#94a3b8"; // slate for unknown, never a false green
  if (score < HEALTH_POOR) return "#ef4444";
  if (score < HEALTH_GOOD) return "#f59e0b";
  return "#10b981";
}

/** Tailwind text classes for a score, light/dark aware. */
export function healthTextClass(score: number | null | undefined): string {
  if (score == null) return "text-slate-500 dark:text-slate-400";
  if (score < HEALTH_POOR) return "text-rose-600 dark:text-rose-400";
  if (score < HEALTH_GOOD) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

/** Border+text classes for outline badges. */
export function healthBadgeClass(score: number | null | undefined): string {
  if (score == null) return "border-slate-400/40 text-slate-400";
  if (score < HEALTH_POOR) return "border-red-500/40 text-red-400";
  if (score < HEALTH_GOOD) return "border-amber-500/40 text-amber-400";
  return "border-emerald-500/40 text-emerald-400";
}

/** "72%" or "—" when there is no score to show. */
export function formatHealth(score: number | null | undefined): string {
  return score == null ? "—" : `${Math.round(score)}%`;
}
