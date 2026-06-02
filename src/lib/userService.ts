/**
 * User Service (admin)
 * CRUD for the admin Users management screen.
 * Talks to the backend /users router (returns the flat UserItemOut shape),
 * with JWT auto-attached via apiClient.
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";

/** Flat user shape returned by GET /users/ (matches backend UserItemOut). */
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

/** Asset assigned to a user, from GET /users/{id}/assets. */
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
}

export async function listUsers(): Promise<UserItem[]> {
  return apiGet<UserItem[]>("/users/");
}

export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  return apiPost<UserItem>("/users/", payload);
}

export async function updateUser(
  userId: string,
  data: Partial<CreateUserPayload>
): Promise<UserItem> {
  return apiPut<UserItem>(`/users/${userId}`, data);
}

export async function getUserAssets(userId: string): Promise<UserAssignedAsset[]> {
  return apiGet<UserAssignedAsset[]>(`/users/${userId}/assets`);
}

export async function deleteUser(userId: string): Promise<{ message: string; id: string }> {
  return apiDelete<{ message: string; id: string }>(`/users/${userId}`);
}
