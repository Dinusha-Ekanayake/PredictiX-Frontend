/**
 * What the utilisation and service-cadence panels put on screen.
 *
 * The states that matter are the ones with too little data: an asset with no
 * readings, and one with a single month, both of which would otherwise render
 * an empty chart frame with no explanation.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ServiceCadenceChart, UtilisationChart, type ChartRow } from "./AssetUsageCharts";

// ResponsiveContainer measures its parent, which is always 0x0 under jsdom, so
// the chart body never draws. A fixed-size stand-in lets the surrounding panel
// render and keeps these assertions about the panel, not about recharts.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 190 }}>{children}</div>
    ),
  };
});

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

describe("UtilisationChart", () => {
  test("says so plainly when the asset has never reported", () => {
    render(<UtilisationChart rows={[]} />);

    expect(screen.getByText(/no operating hours recorded/i)).toBeInTheDocument();
  });

  test("explains a single month rather than drawing an invisible line", () => {
    render(<UtilisationChart rows={[row()]} />);

    expect(screen.getByText(/only one month of operating history/i)).toBeInTheDocument();
  });

  test("shows the running, idle and idle-share totals once there is a trend", () => {
    render(<UtilisationChart rows={[row({ operating: 80, idle: 20 }), row({ operating: 120, idle: 30 })]} />);

    expect(screen.getByText("200h")).toBeInTheDocument();
    expect(screen.getByText("50h")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  test("keeps its title so the panel is identifiable", () => {
    render(<UtilisationChart rows={[row(), row()]} />);

    expect(screen.getByText(/utilisation & duty cycle/i)).toBeInTheDocument();
  });

  test("months that recorded nothing count as empty, not as a trend", () => {
    const blank = [row({ operating: null, idle: null }), row({ operating: null, idle: null })];

    render(<UtilisationChart rows={blank} />);

    expect(screen.getByText(/no operating hours recorded/i)).toBeInTheDocument();
  });
});

describe("ServiceCadenceChart", () => {
  test("says so plainly when there is no service history", () => {
    render(<ServiceCadenceChart rows={[]} />);

    expect(screen.getByText(/no service or downtime history/i)).toBeInTheDocument();
  });

  test("counts the services in the window from the counter resets", () => {
    const rows = [30, 60, 5, 40, 2].map((d) => row({ sinceService: d, downtime: 0 }));

    render(<ServiceCadenceChart rows={rows} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("totals the downtime hours across the window", () => {
    const rows = [row({ downtime: 10 }), row({ downtime: 5 })];

    render(<ServiceCadenceChart rows={rows} />);

    expect(screen.getByText("15h")).toBeInTheDocument();
  });

  test("keeps its title so the panel is identifiable", () => {
    render(<ServiceCadenceChart rows={[row(), row()]} />);

    expect(screen.getByText(/service cadence & downtime/i)).toBeInTheDocument();
  });
});
