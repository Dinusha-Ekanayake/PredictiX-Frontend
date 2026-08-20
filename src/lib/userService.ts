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
  healthPercent: number | null;
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
  if (!res.ok) throw new Error(await assignmentError(res, "unassign"));
}

/**
 * Assign an asset to a user.
 *
 * Admin only. The server checks the asset is in the caller's warehouse, that
 * the assignee exists, is active, and belongs to the same warehouse, then
 * records the change in the assignment history.
 *
 * Reassigning an already-assigned asset is allowed and closes the previous
 * assignment; the caller does not need to unassign first.
 */
export async function assignAsset(
  assetId: string,
  userId: string,
  notes?: string,
): Promise<void> {
  const params = new URLSearchParams({ assigned_to: userId });
  if (notes?.trim()) params.set("notes", notes.trim());
  const res = await apiFetch(`/assets/${assetId}/assign?${params}`, { method: "PATCH" });
  if (!res.ok) throw new Error(await assignmentError(res, "assign"));
}

/** Pull the server's own message out of a failed assignment response. */
async function assignmentError(res: Response, verb: string): Promise<string> {
  try {
    const body = await res.json();
    if (body?.detail) return String(body.detail);
  } catch {
    // Non-JSON error body: fall through to the status-based message.
  }
  return `Failed to ${verb} asset (HTTP ${res.status})`;
}