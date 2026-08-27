/**
 * The asset panel's utilisation and service-cadence charts.
 *
 * These helpers decide what the charts claim. A null month treated as zero
 * would draw an idle asset as a working one, and a service count taken from
 * the wrong direction would report services that never happened.
 */
import { describe, expect, test } from "vitest";

import {
  countServiceResets,
  dutySplit,
  formatPeriod,
  seriesState,
  toChartRows,
  type ChartRow,
} from "./AssetUsageCharts";
import type { UsagePoint } from "./types";

function point(over: Partial<UsagePoint> = {}): UsagePoint {
  return {
    period: "2026-01-10",
    operating_hours: 100,
    idle_hours: 20,
    distance_km: 500,
    days_since_last_service: 30,
    downtime_hours_90d: 4,
    ...over,
  };
}

function row(over: Partial<ChartRow> = {}): ChartRow {
  return {
    period: "2026-01-10",
    label: "Jan 26",
    operating: 100,
    idle: 20,
    distance: 500,
    sinceService: 30,
    downtime: 4,
    ...over,
  };
}

describe("formatPeriod", () => {
  test("renders a month and two-digit year for the axis", () => {
    expect(formatPeriod("2024-09-10")).toBe("Sep 24");
  });

  test("returns the input unchanged when it is not a date", () => {
    expect(formatPeriod("not-a-date")).toBe("not-a-date");
  });

  test("uses a three-letter month, since en-GB renders September as Sept", () => {
    expect(formatPeriod("2024-09-10")).toHaveLength(6);
  });

  test("the first of a month keeps that month, whatever the viewer's timezone", () => {
    // Parsed as a Date this is UTC midnight, which is the previous month for
    // anyone behind UTC.
    expect(formatPeriod("2026-01-01")).toBe("Jan 26");
    expect(formatPeriod("2026-03-01")).toBe("Mar 26");
  });

  test("a month outside 1-12 is not mapped to a bogus name", () => {
    expect(formatPeriod("2026-13-01")).toBe("2026-13-01");
    expect(formatPeriod("2026-00-01")).toBe("2026-00-01");
  });
});

describe("toChartRows", () => {
  test("maps the API shape onto the chart keys", () => {
    const [r] = toChartRows([point()]);

    expect(r).toMatchObject({
      label: "Jan 26",
      operating: 100,
      idle: 20,
      distance: 500,
      sinceService: 30,
      downtime: 4,
    });
  });

  test("keeps a missing month as null so it plots as a gap, not a zero", () => {
    const [r] = toChartRows([point({ operating_hours: null, downtime_hours_90d: null })]);

    expect(r.operating).toBeNull();
    expect(r.downtime).toBeNull();
  });

  test("an empty history produces no rows", () => {
    expect(toChartRows([])).toEqual([]);
  });

  test("preserves the order it is given, which the API sends oldest first", () => {
    const rows = toChartRows([
      point({ period: "2026-01-10" }),
      point({ period: "2026-02-10" }),
    ]);

    expect(rows.map((r) => r.label)).toEqual(["Jan 26", "Feb 26"]);
  });
});

describe("seriesState", () => {
  test("reports empty when there are no rows at all", () => {
    expect(seriesState([], ["operating", "idle"])).toBe("empty");
  });

  test("reports empty when every row is null for the keys asked about", () => {
    const rows = [row({ operating: null, idle: null }), row({ operating: null, idle: null })];

    expect(seriesState(rows, ["operating", "idle"])).toBe("empty");
  });

  test("reports single for one usable point, which would draw no visible line", () => {
    const rows = [row(), row({ operating: null, idle: null })];

    expect(seriesState(rows, ["operating", "idle"])).toBe("single");
  });

  test("reports ok once two points can be joined", () => {
    expect(seriesState([row(), row()], ["operating", "idle"])).toBe("ok");
  });

  test("a row counts when any one of the keys has a value", () => {
    const rows = [row({ operating: null }), row({ idle: null })];

    expect(seriesState(rows, ["operating", "idle"])).toBe("ok");
  });
});

describe("dutySplit", () => {
  test("totals running and idle hours and gives the idle share", () => {
    const rows = [row({ operating: 80, idle: 20 }), row({ operating: 120, idle: 30 })];

    expect(dutySplit(rows)).toEqual({ operating: 200, idle: 50, idlePct: 20 });
  });

  test("nulls contribute nothing rather than breaking the total", () => {
    const rows = [row({ operating: 100, idle: null }), row({ operating: null, idle: 100 })];

    expect(dutySplit(rows)).toEqual({ operating: 100, idle: 100, idlePct: 50 });
  });

  test("returns null when nothing was recorded, so no split is claimed", () => {
    expect(dutySplit([row({ operating: null, idle: null })])).toBeNull();
    expect(dutySplit([row({ operating: 0, idle: 0 })])).toBeNull();
    expect(dutySplit([])).toBeNull();
  });
});

describe("countServiceResets", () => {
  test("counts each drop in the days-since-service counter as one service", () => {
    // Climbs, resets, climbs, resets again.
    const rows = [30, 60, 5, 40, 2].map((d) => row({ sinceService: d }));

    expect(countServiceResets(rows)).toBe(2);
  });

  test("a counter that only climbs means no service in the window", () => {
    const rows = [10, 40, 70, 100].map((d) => row({ sinceService: d }));

    expect(countServiceResets(rows)).toBe(0);
  });

  test("null months are skipped without being read as a reset", () => {
    const rows = [
      row({ sinceService: 50 }),
      row({ sinceService: null }),
      row({ sinceService: 80 }),
    ];

    expect(countServiceResets(rows)).toBe(0);
  });

  test("a reset either side of a null month is still counted once", () => {
    const rows = [
      row({ sinceService: 50 }),
      row({ sinceService: null }),
      row({ sinceService: 3 }),
    ];

    expect(countServiceResets(rows)).toBe(1);
  });

  test("an empty window reports no services", () => {
    expect(countServiceResets([])).toBe(0);
  });

  test("a single month cannot show a reset", () => {
    expect(countServiceResets([row({ sinceService: 30 })])).toBe(0);
  });
});
