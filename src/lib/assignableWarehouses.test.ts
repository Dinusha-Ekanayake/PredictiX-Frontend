import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWarehouses = vi.fn<() => Promise<string[]>>();
const getUserRole = vi.fn<() => string | null>();
const getUser = vi.fn<() => { warehouse_name?: string } | null>();

vi.mock("@/lib/api/userProfileApi", () => ({ fetchWarehouses: () => fetchWarehouses() }));
vi.mock("@/lib/authService", () => ({
  getUserRole: () => getUserRole(),
  getUser: () => getUser(),
}));

import { fetchAssignableWarehouses } from "./assignableWarehouses";

const ALL = ["Colombo", "Kandy", "Galle"];

describe("fetchAssignableWarehouses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchWarehouses.mockResolvedValue(ALL);
  });

  it("offers every warehouse to a super admin", async () => {
    getUserRole.mockReturnValue("SUPER_ADMIN");
    getUser.mockReturnValue({ warehouse_name: "Kandy" });
    await expect(fetchAssignableWarehouses()).resolves.toEqual(ALL);
  });

  it("limits an admin to their own warehouse", async () => {
    getUserRole.mockReturnValue("ADMIN");
    getUser.mockReturnValue({ warehouse_name: "Kandy" });
    await expect(fetchAssignableWarehouses()).resolves.toEqual(["Kandy"]);
  });

  it("falls back to the full list when the admin's warehouse is unknown", async () => {
    getUserRole.mockReturnValue("ADMIN");
    getUser.mockReturnValue({});
    await expect(fetchAssignableWarehouses()).resolves.toEqual(ALL);

    getUser.mockReturnValue({ warehouse_name: "Jaffna" });
    await expect(fetchAssignableWarehouses()).resolves.toEqual(ALL);
  });

  it("passes on a failure to load the list", async () => {
    getUserRole.mockReturnValue("ADMIN");
    fetchWarehouses.mockRejectedValue(new Error("network down"));
    await expect(fetchAssignableWarehouses()).rejects.toThrow("network down");
  });
});
