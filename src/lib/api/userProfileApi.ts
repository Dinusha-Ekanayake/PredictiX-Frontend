import { apiGet, apiPost, apiPut } from "@/lib/apiClient";

export type UserProfileData = {
  id: string;
  employee_id: string | null;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  contactNumber: string | null;
  address: string | null;
  department: string | null;
  department_id: string | null;
  warehouse: string | null;
  warehouse_id: string | null;
  role: string;
  status: string;
  assignedAssetsCount: number;
  avatar_url?: string | null;
  settings?: {
    emailNotifications?: boolean;
    criticalAlerts?: boolean;
    maintenanceAlerts?: boolean;
    compactView?: boolean;
  };
};

export type UserAssetData = {
  assignment_id: string;
  asset_id: string;
  asset_code: string;
  name: string;
  asset_type: string;
  category: string | null;
  location: string;
  status: string;
  healthPercent: number;
  nextServiceDate: string | null;
};

export type UserStatsData = {
  assignedAssets: number;
  activeAssets: number;
};

export type TeamMemberData = {
  id: string;
  employee_id: string | null;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  contactNumber: string | null;
  department: string | null;
  role: string;
  status: string;
};

/**
 * The caller's own profile, de-duplicated across components.
 *
 * The navbar and the page body both need it, so without sharing, every screen
 * issues two identical /profiles/me requests. Against Supabase that is a real
 * cost: the endpoint takes ~850ms, and the two run in parallel competing for
 * the same connection pool.
 *
 * In-flight requests share one promise, and the resolved value is reused for a
 * short window so a navigation does not refetch immediately. The window is
 * deliberately small because the profile carries role and status, and a stale
 * one must not outlive a deactivation for long.
 */
const PROFILE_TTL_MS = 30_000;
let profileCache: { at: number; data: UserProfileData } | null = null;
let profileInFlight: Promise<UserProfileData> | null = null;

export async function fetchMyProfile(): Promise<UserProfileData> {
  if (profileCache && Date.now() - profileCache.at < PROFILE_TTL_MS) {
    return profileCache.data;
  }
  if (profileInFlight) return profileInFlight;

  profileInFlight = apiGet<UserProfileData>("/profiles/me")
    .then((data) => {
      profileCache = { at: Date.now(), data };
      return data;
    })
    .finally(() => {
      profileInFlight = null;
    });
  return profileInFlight;
}

/** Drop the cached profile. Call after anything that changes it, and on sign-out
 *  so the next account does not read the previous one's profile. */
export function invalidateMyProfile(): void {
  profileCache = null;
  profileInFlight = null;
}

export async function updateMyProfile(data: {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: string;
  settings?: {
    emailNotifications?: boolean;
    criticalAlerts?: boolean;
    maintenanceAlerts?: boolean;
    compactView?: boolean;
  };
}): Promise<UserProfileData> {
  const updated = await apiPut<UserProfileData>("/profiles/me", data);
  // Seed the cache with the server's response rather than clearing it, so the
  // next read is both fresh and free.
  profileCache = { at: Date.now(), data: updated };
  return updated;
}

export async function fetchMyAssets(): Promise<UserAssetData[]> {
  return apiGet<UserAssetData[]>("/profiles/me/assets");
}

export async function fetchMyStats(): Promise<UserStatsData> {
  return apiGet<UserStatsData>("/profiles/me/stats");
}

export type UserItemOut = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  address: string;
  contactNumber: string;
  warehouse: string;
  role: "admin" | "user";
  department: string;
  status: "active" | "inactive";
  assignedAssets: number;
};

export async function fetchAllUsers(): Promise<UserItemOut[]> {
  return apiGet<UserItemOut[]>("/users/");
}

export async function addUser(user: Omit<UserItemOut, "assignedAssets"> & { assignedAssets?: number }): Promise<UserItemOut> {
  return apiPost<UserItemOut>("/users/", {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    address: user.address,
    contactNumber: user.contactNumber,
    warehouse: user.warehouse,
    role: user.role,
    department: user.department,
    status: user.status,
  });
}

export async function fetchDepartments(): Promise<string[]> {
  const rows = await apiGet<Array<{ name?: string } | string>>("/departments/");
  // Endpoint returns Department objects; surface just the names.
  return rows.map((d) => (typeof d === "string" ? d : d.name ?? "")).filter(Boolean);
}

export async function fetchWarehouses(): Promise<string[]> {
  const rows = await apiGet<Array<{ name?: string } | string>>("/warehouses/");
  // Endpoint returns Warehouse objects; surface just the names.
  return rows.map((w) => (typeof w === "string" ? w : w.name ?? "")).filter(Boolean);
}

/**
 * Warehouses as id/name pairs.
 *
 * fetchWarehouses throws the ids away, so it cannot turn an asset's
 * warehouse_id into a name. Any view that renders an asset needs that mapping,
 * otherwise the detail panel falls back to printing the raw UUID.
 */
export async function fetchWarehouseOptions(): Promise<{ value: string; label: string }[]> {
  const rows = await apiGet<Array<{ id?: string; name?: string }>>("/warehouses/");
  return rows
    .filter((w) => w?.id && w?.name)
    .map((w) => ({ value: String(w.id), label: String(w.name) }));
}

export async function fetchUserAssets(userId: string): Promise<UserAssetData[]> {
  return apiGet<UserAssetData[]>(`/users/${userId}/assets`);
}

export async function updateUser(userId: string, data: Partial<UserItemOut>): Promise<UserItemOut> {
  return apiPut<UserItemOut>(`/users/${userId}`, data);
}

/**
 * Colleagues in the current user's department.
 *
 * Pass `limit` when you only need a preview, the dashboard's "My Team" card
 * shows eight, and unbounded this returns the whole department (measured at
 * 519 people / 150 KB for one Colombo driver). Omit it for the team directory,
 * which searches across the full list client-side.
 */
export async function getTeamMembers(limit?: number): Promise<TeamMemberData[]> {
  const query = limit != null ? `?limit=${limit}` : "";
  return apiGet<TeamMemberData[]>(`/profiles/me/colleagues${query}`);
}
