import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ViewAssignedAssetsDialog, {
  type AssetItem,
} from "@/components/admin/users/ViewAssignedAssetsDialog";

// This dialog lists the assets assigned to one person. The health figure it
// shows comes from the model, so an asset that was never scored must show a
// dash rather than a number a reader could mistake for a measurement.

vi.mock("@/lib/userService", () => ({
  unassignAsset: vi.fn().mockResolvedValue(undefined),
}));

function asset(overrides: Partial<AssetItem> = {}): AssetItem {
  return {
    id: "asset-1",
    asset_id: "asset-1",
    name: "Forklift 12",
    category: "Forklift",
    location: "LankaLogix - Colombo",
    healthPercent: 72,
    ...overrides,
  };
}

function show(assets: AssetItem[], props: Record<string, unknown> = {}) {
  render(
    <ViewAssignedAssetsDialog
      userName="Nimal Perera"
      assets={assets}
      open
      onOpenChange={() => {}}
      {...props}
    />,
  );
}

test("the person's name is shown in the dialog", () => {
  show([asset()]);
  // The name sits next to the asset count in one line, so match the line.
  expect(screen.getByText(/Nimal Perera/)).toBeInTheDocument();
});

test("the dialog says how many assets the person has", () => {
  show([asset(), asset({ id: "a2", asset_id: "a2", name: "Pallet Jack 7" })]);
  expect(screen.getByText(/2 assets/)).toBeInTheDocument();
});

test("an assigned asset is listed by name", () => {
  show([asset({ name: "Reach Truck 4" })]);
  expect(screen.getByText("Reach Truck 4")).toBeInTheDocument();
});

test("the asset's location is shown", () => {
  show([asset()]);
  expect(screen.getByText("LankaLogix - Colombo")).toBeInTheDocument();
});

test("a scored asset shows its health percentage", () => {
  show([asset({ healthPercent: 72 })]);
  expect(screen.getByText("Health: 72%")).toBeInTheDocument();
});

test("a health percentage is rounded for display", () => {
  show([asset({ healthPercent: 33.93 })]);
  expect(screen.getByText("Health: 34%")).toBeInTheDocument();
});

test("an asset with no prediction shows a dash instead of a number", () => {
  show([asset({ healthPercent: null })]);
  expect(screen.getByText("Health: —")).toBeInTheDocument();
});

test("an unscored asset never displays as zero percent health", () => {
  show([asset({ healthPercent: null })]);
  expect(screen.queryByText("Health: 0%")).not.toBeInTheDocument();
});

test("an unscored asset explains itself on hover", () => {
  show([asset({ healthPercent: null })]);
  expect(screen.getByTitle(/no completed prediction/i)).toBeInTheDocument();
});

test("a message is shown when the person has no assets assigned", () => {
  show([]);
  expect(screen.getByText(/no assets currently assigned/i)).toBeInTheDocument();
});

test("a loading message is shown while the assets are still being fetched", () => {
  show([], { loading: true });
  expect(screen.getByText(/loading assigned assets/i)).toBeInTheDocument();
});

test("every assigned asset is listed, not just the first", () => {
  show([
    asset({ id: "a1", asset_id: "a1", name: "Forklift 12" }),
    asset({ id: "a2", asset_id: "a2", name: "Pallet Jack 7" }),
    asset({ id: "a3", asset_id: "a3", name: "Reach Truck 4" }),
  ]);
  expect(screen.getByText("Forklift 12")).toBeInTheDocument();
  expect(screen.getByText("Pallet Jack 7")).toBeInTheDocument();
  expect(screen.getByText("Reach Truck 4")).toBeInTheDocument();
});

test("the unassign button is hidden when the dialog is read-only", () => {
  show([asset()]);
  expect(screen.queryByText(/unassign from this user/i)).not.toBeInTheDocument();
});

test("the unassign button appears when unassigning is allowed", () => {
  show([asset()], { onUnassigned: () => {} });
  expect(screen.getByText(/unassign from this user/i)).toBeInTheDocument();
});
