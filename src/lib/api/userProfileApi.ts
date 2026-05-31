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
  const res = await fetch(`${API_URL}/user-profile/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Failed to fetch users");
  }
  return res.json();
}

export async function addUser(user: Omit<UserItemOut, "assignedAssets"> & { assignedAssets?: number }): Promise<UserItemOut> {
  const res = await fetch(`${API_URL}/user-profile/users`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
      status: user.status
    }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Failed to create user");
  }
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

export async function fetchUserAssets(userId: string): Promise<UserAssetData[]> {
  const res = await fetch(`${API_URL}/user-profile/users/${userId}/assets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user assets");
  return res.json();
}

export async function updateUser(userId: string, data: Partial<UserItemOut>): Promise<UserItemOut> {
  const res = await fetch(`${API_URL}/user-profile/users/${userId}`, {
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
