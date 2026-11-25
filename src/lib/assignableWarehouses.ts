import { fetchWarehouses } from "@/lib/api/userProfileApi";
import { getUser, getUserRole } from "@/lib/authService";

/**
 * Warehouse names the signed-in admin may place a user in.
 *
 * A super admin may use any warehouse. A regular admin manages only their own,
 * which the API enforces, so the picker offers just that one. If the stored
 * session has no warehouse name the full list is shown and the API decides.
 */
export async function fetchAssignableWarehouses(): Promise<string[]> {
  const all = await fetchWarehouses();
  if (getUserRole() !== "ADMIN") return all;
  const own = getUser()?.warehouse_name;
  return own && all.includes(own) ? [own] : all;
}
