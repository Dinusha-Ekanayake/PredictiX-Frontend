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
<<<<<<< HEAD
=======
  avatar_url?: string | null;
  settings?: {
    emailNotifications?: boolean;
    criticalAlerts?: boolean;
    maintenanceAlerts?: boolean;
    compactView?: boolean;
  };
>>>>>>> 3e0080c (fix: change toast import to sonner instead of react-hot-toast)
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

<<<<<<< HEAD
=======
export async function fetchMyProfile(): Promise<UserProfileData> {
  const res = await fetch(`${API_URL}/profiles/me`, {
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
  settings?: {
    emailNotifications?: boolean;
    criticalAlerts?: boolean;
    maintenanceAlerts?: boolean;
    compactView?: boolean;
  };
}): Promise<UserProfileData> {
  const res = await fetch(`${API_URL}/profiles/me`, {
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
  const res = await fetch(`${API_URL}/profiles/me/assets`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export async function fetchMyStats(): Promise<UserStatsData> {
  const res = await fetch(`${API_URL}/profiles/me/stats`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${res.status}`);
  }
  
  return res.json();
}

>>>>>>> 3e0080c (fix: change toast import to sonner instead of react-hot-toast)
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
// My Profile endpoints
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
// Admin Users — /users (maps to app/routers/users.py)
// ---------------------------------------------------------------------------

export async function fetchAllUsers(): Promise<UserItemOut[]> {
  const res = await fetch(`${API_URL}/users/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || "Failed to fetch users"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json();

  return data.map((u) => ({
    id: u.id ?? "",
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    name: u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
    email: u.email ?? "",
    address: u.address ?? "",
    contactNumber: u.contactNumber ?? "",
    warehouse: u.warehouse ?? "",
    role: (u.role?.toLowerCase() ?? "user") as "admin" | "user",
    department: u.department ?? "",
    status: (u.status?.toLowerCase() ?? "active") as "active" | "inactive",
    assignedAssets:
      typeof u.assignedAssets === "number" ? u.assignedAssets : 0,
  }));
}

export async function addUser(payload: {
  id?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  address: string;
  contactNumber: string;
  warehouse: string;
  role: string;
  department: string;
  status: string;
  password?: string;
}): Promise<UserItemOut> {
  const res = await fetch(`${API_URL}/users/`, {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u: any = await res.json();

  return {
    id: u.id ?? "",
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    name: u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
    email: u.email ?? "",
    address: u.address ?? "",
    contactNumber: u.contactNumber ?? "",
    warehouse: u.warehouse ?? "",
    role: (u.role?.toLowerCase() ?? "user") as "admin" | "user",
    department: u.department ?? "",
    status: (u.status?.toLowerCase() ?? "active") as "active" | "inactive",
    assignedAssets:
      typeof u.assignedAssets === "number" ? u.assignedAssets : 0,
  };
}

export async function updateUser(
  userId: string,
  data: Partial<UserItemOut>
): Promise<UserItemOut> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
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

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete user");
  }
}

export async function fetchUserAssets(
  userId: string
): Promise<UserAssetData[]> {
  const res = await fetch(`${API_URL}/users/${userId}/assets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch user assets");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json();

  return data.map((a) => ({
    assignment_id: a.assignment_id ?? a.asset_id ?? "",
    asset_id: a.asset_id ?? "",
    asset_code: a.asset_code ?? "",
    name: a.name ?? a.asset_name ?? "Unknown Asset",
    asset_type: a.asset_type ?? "",
    category: a.category ?? null,
    location: a.location ?? "",
    status: a.status ?? "active",
    healthPercent:
      typeof a.healthPercent === "number"
        ? a.healthPercent
        : typeof a.criticality_score === "number"
          ? a.criticality_score
          : 0,
    nextServiceDate: a.nextServiceDate ?? a.next_service_date ?? null,
  }));
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