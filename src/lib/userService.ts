/**
 * User Service (admin)
 * CRUD for the admin Users management screen.
 */
import { apiGet, apiPost, apiPut, apiDelete, apiFetch } from "@/lib/apiClient";

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  address: string;
  contactNumber: string;
  warehouse: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  assignedAssets: number;
}

export interface UserAssignedAsset {
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
}

export interface CreateUserPayload {
  id?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  address: string;
  contactNumber: string;
  warehouse: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  password?: string;        // ← added
}

export async function listUsers(): Promise<UserItem[]> {
  return apiGet<UserItem[]>("/users/");
}

export async function createUser(
  payload: CreateUserPayload
): Promise<UserItem> {
  return apiPost<UserItem>("/users/", payload);
}

export async function updateUser(
  userId: string,
  data: Partial<CreateUserPayload>
): Promise<UserItem> {
  return apiPut<UserItem>(`/users/${userId}`, data);
}

export async function getUserAssets(
  userId: string
): Promise<UserAssignedAsset[]> {
  return apiGet<UserAssignedAsset[]>(`/users/${userId}/assets`);
}

export async function deleteUser(
  userId: string
): Promise<{ message: string; id: string }> {
  return apiDelete<{ message: string; id: string }>(`/users/${userId}`);
}

/**
 * Clear an asset's assignee.
 *
 * `PATCH /assets/{id}/assign` sets `assigned_to` from the query parameter of
 * the same name; omitting it is how that endpoint expresses "unassign". It is
 * admin-only and warehouse-scope-checked server-side.
 */
export async function unassignAsset(assetId: string): Promise<void> {
  const res = await apiFetch(`/assets/${assetId}/assign`, { method: "PATCH" });
  if (!res.ok) {
    let detail = `Failed to unassign asset (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // Non-JSON error body — keep the status-based message.
    }
    throw new Error(detail);
  }
}