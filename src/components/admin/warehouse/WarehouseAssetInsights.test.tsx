/**
 * The warehouse health and status cards must describe assets the same way the
 * admin dashboard does: health bands come from the backend's shared band
 * definition, and "critical" is a health band, never an operational status.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { AssetStatusDistributionCard, HealthScoreDistributionCard } from "./WarehouseAssetInsights";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 200, height: 200 }}>{children}</div>
    ),
  };
});

describe("AssetStatusDistributionCard", () => {
  test("does not list a Critical status that no asset can ever have", () => {
    render(<AssetStatusDistributionCard data={[{ name: "active", value: 380 }, { name: "inactive", value: 20 }]} />);

    expect(screen.queryByText(/critical/i)).toBeNull();
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText(/under maintenance/i)).toBeTruthy();
  });
});

describe("HealthScoreDistributionCard", () => {
  test("labels each slice with the shared band name and its range", () => {
    render(
      <HealthScoreDistributionCard
        data={[
          { bucket: "Excellent", range: "≥ 60%", count: 34 },
          { bucket: "Critical", range: "< 25%", count: 127 },
        ]}
      />,
    );

    expect(screen.getByText("Critical (< 25%)")).toBeTruthy();
    expect(screen.getByText("127")).toBeTruthy();
    expect(screen.getByText("Excellent (≥ 60%)")).toBeTruthy();
  });
});
