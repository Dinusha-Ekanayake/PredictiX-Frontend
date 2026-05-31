const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
      localStorage.getItem("predictix.access_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Profile endpoints
// ---------------------------------------------------------------------------

export async function fetchMyProfile(): Promise<UserProfileData> {
  const res = await fetch(`${API_URL}/user-profile/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateMyProfile(data: {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: string;
}): Promise<UserProfileData> {
  const res = await fetch(`${API_URL}/user-profile/me`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchMyAssets(): Promise<UserAssetData[]> {
  const res = await fetch(`${API_URL}/user-profile/me/assets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchMyStats(): Promise<UserStatsData> {
  const res = await fetch(`${API_URL}/user-profile/me/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Admin user endpoints — talks to FastAPI /api/v1/users
// ---------------------------------------------------------------------------

export async function fetchAllUsers(): Promise<UserItemOut[]> {
  const res = await fetch(`${API_URL}/api/v1/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || "Failed to fetch users"
    );
  }

  const data: Array<Record<string, unknown>> = await res.json();

  return data.map((u) => ({
    id: u.user_id as string,
    firstName: (u.first_name as string) ?? "",
    lastName: (u.last_name as string) ?? "",
    name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
    email: (u.email as string) ?? "",
    address: (u.residence_address as string) ?? "",
    contactNumber: (u.contact_no as string) ?? "",
    warehouse: (u.warehouse as string) ?? "",
    role: ((u.role as string)?.toLowerCase() ?? "user") as "admin" | "user",
    department: (u.department as string) ?? "",
    status: ((u.status as string)?.toLowerCase() ?? "active") as
      | "active"
      | "inactive",
    assignedAssets: 0,
  }));
}

export async function addUser(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  department: string;
  residence_address?: string;
  contact_no?: string;
  warehouse?: string;
}): Promise<UserItemOut> {
  const res = await fetch(`${API_URL}/api/v1/users`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || "Failed to create user"
    );
  }

  const u: Record<string, unknown> = await res.json();

  return {
    id: u.user_id as string,
    firstName: (u.first_name as string) ?? "",
    lastName: (u.last_name as string) ?? "",
    name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
    email: (u.email as string) ?? "",
    address: (u.residence_address as string) ?? "",
    contactNumber: (u.contact_no as string) ?? "",
    warehouse: (u.warehouse as string) ?? "",
    role: ((u.role as string)?.toLowerCase() ?? "user") as "admin" | "user",
    department: (u.department as string) ?? "",
    status: ((u.status as string)?.toLowerCase() ?? "active") as
      | "active"
      | "inactive",
    assignedAssets: 0,
  };
}

export async function updateUser(
  userId: string,
  data: Partial<UserItemOut>
): Promise<UserItemOut> {
  const res = await fetch(`${API_URL}/api/v1/users/${userId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update user");
  }
  return res.json();
}

export async function fetchUserAssets(
  userId: string
): Promise<UserAssetData[]> {
  const res = await fetch(`${API_URL}/user-profile/users/${userId}/assets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user assets");
  return res.json();
}

export async function fetchDepartments(): Promise<string[]> {
  const res = await fetch(`${API_URL}/user-profile/departments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function fetchWarehouses(): Promise<string[]> {
  const res = await fetch(`${API_URL}/user-profile/warehouses`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch warehouses");
  return res.json();
}

export async function getTeamMembers(): Promise<TeamMemberData[]> {
  const res = await fetch(`${API_URL}/user-profile/me/colleagues`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch team members");
  }
  return res.json();
}