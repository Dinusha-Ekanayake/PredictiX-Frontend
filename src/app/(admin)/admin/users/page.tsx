"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import PageHero from "@/components/common/PageHero";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AddUserDialog from "@/components/admin/users/AddUserDialog";
import type { NewUser } from "@/components/admin/users/AddUserDialog";
import ViewUserDetailsDialog from "@/components/admin/users/ViewUserDetailsDialog";
import ViewAssignedAssetsDialog from "@/components/admin/users/ViewAssignedAssetsDialog";
import EditUserDialog from "@/components/admin/users/EditUserDialog";
import { toast } from "@/lib/customToast";
import { useRouter } from "next/navigation";

import {
  listUsers,
  createUser,
  updateUser,
  getUserAssets,
  type UserItem,
  type UserRole,
  type UserStatus,
  type CreateUserPayload,
} from "@/lib/userService";

import {
  Users,
  UserCheck,
  Shield,
  UserRound,
  UserPlus,
  Search,
  Building2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AssignedAsset = {
  id: string;
  asset_id?: string;
  name: string;
  category: string;
  location: string;
  healthPercent: number;
};

// ---------------------------------------------------------------------------
// KPI helpers
// ---------------------------------------------------------------------------

function computeKpis(users: UserItem[]) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const regular = users.filter((u) => u.role === "user").length;
  return [
    { label: "Total Users", value: total, icon: Users },
    { label: "Active", value: active, icon: UserCheck },
    { label: "Admins", value: admins, icon: Shield },
    { label: "Regular Users", value: regular, icon: UserRound },
  ] as const;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "admin") {
    return (
      <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
        admin
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-violet-600 text-white hover:bg-violet-600">
      user
    </Badge>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
        active
      </Badge>
    );
  }
  return <Badge variant="secondary">inactive</Badge>;
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function UserAvatar({ name }: { name: string }) {
  const initials =
    (name || "?")
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut Chart (recharts)
// ---------------------------------------------------------------------------

type ChartEntry = { label: string; value: number; color: string };

function DonutChart({ data, title }: { data: ChartEntry[]; title: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.map((d) => ({ name: d.label, value: d.value }))}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [value, name]}
                contentStyle={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: d.color }}
              />
              <span className="truncate text-muted-foreground">{d.label}</span>
              <span className="ml-auto font-medium tabular-nums">
                {d.value}
                <span className="text-muted-foreground font-normal ml-1">
                  ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [detailsUser, setDetailsUser] = React.useState<UserItem | null>(null);
  const [editUser, setEditUser] = React.useState<UserItem | null>(null);
  const [assetsUser, setAssetsUser] = React.useState<UserItem | null>(null);
  const [assignedAssets, setAssignedAssets] = React.useState<AssignedAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = React.useState(false);

  function generateUserId(role: UserRole, department: string): string {
    const roleLetter = role === "admin" ? "A" : "U";
    const deptLetter = department.charAt(0).toUpperCase() || "X";
    const relevantUsers = users.filter((u) => u.id.startsWith(roleLetter));
    let maxNumber = 0;
    for (const u of relevantUsers) {
      const match = u.id.match(/^[AU](\d{4})[A-Z]?$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > maxNumber) maxNumber = num;
      }
    }
    const next = String(maxNumber + 1).padStart(4, "0");
    return `${roleLetter}${next}${deptLetter}`;
  }

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await listUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load users", {
            description: err instanceof Error ? err.message : undefined,
          });
          setUsers([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Dynamic department list from real data
  const departments = React.useMemo(() => {
    const set = new Set(users.map((u) => u.department).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  // Department chart data
  const deptChartData = React.useMemo((): ChartEntry[] => {
    const COLORS = [
      "#2a78d6", "#1baf7a", "#eda100", "#4a3aa7",
      "#e34948", "#e87ba4", "#eb6834", "#888780",
    ];
    const map: Record<string, number> = {};
    users.forEach((u) => {
      if (u.department) map[u.department] = (map[u.department] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        color: COLORS[i % COLORS.length],
      }));
  }, [users]);

  // Role chart data
  const roleChartData = React.useMemo((): ChartEntry[] => {
    const adminCount = users.filter((u) => u.role === "admin").length;
    const userCount = users.filter((u) => u.role === "user").length;
    return [
      { label: "Regular users", value: userCount, color: "#2a78d6" },
      { label: "Admins", value: adminCount, color: "#1baf7a" },
    ].filter((d) => d.value > 0);
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        query === "" ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesDepartment =
        departmentFilter === "all" || user.department === departmentFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, departmentFilter, statusFilter]);

  const kpis = computeKpis(users);

  async function handleUserAdded(newUser: NewUser) {
    try {
      const created = await createUser({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        contactNumber: newUser.contactNumber,
        warehouse: newUser.warehouse,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
      });
      setUsers((prev) => [created, ...prev]);
      toast.success("User created", { description: `${created.name} added.` });
    } catch (err) {
      toast.error("Failed to create user", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function handleUserUpdated(
    userId: string,
    updatedFields: Partial<CreateUserPayload>
  ) {
    try {
      const updatedUser = await updateUser(userId, updatedFields);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u))
      );
      toast.success("User updated", {
        description: `${updatedUser.name} has been updated.`,
      });
    } catch (err) {
      toast.error("Failed to update user", {
        description: err instanceof Error ? err.message : undefined,
      });
      throw err;
    }
  }

  async function handleViewAssets(user: UserItem) {
    setAssetsUser(user);
    setAssignedAssets([]);
    setAssetsLoading(true);
    try {
      const rows = await getUserAssets(user.id);
      setAssignedAssets(
        rows.map((a) => ({
          id: a.asset_id,
          asset_id: a.asset_id,
          name: a.name,
          category: a.category ?? a.asset_type ?? "General",
          location: a.location,
          healthPercent: Math.round(a.healthPercent),
        }))
      );
    } catch (err) {
      toast.error("Failed to load assigned assets", {
        description: err instanceof Error ? err.message : undefined,
      });
      setAssignedAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }

  function handleNavigateToAsset(assetId: string) {
    setAssetsUser(null);
    router.push(`/admin/assets?assetId=${assetId}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading users…" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHero
        crumbs={["PredictiX", "Admin", "Users"]}
        title="User Management"
        subtitle="Manage user accounts, roles, departments and assigned assets."
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
              <k.icon className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department & Role distribution charts */}
      {users.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DonutChart data={deptChartData} title="Department distribution" />
          <DonutChart data={roleChartData} title="Role distribution" />
        </div>
      )}

      {/* Search + filter bar */}
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="ml-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users table — click row to open View Details */}
      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-60 pl-6">User</TableHead>
                  <TableHead className="w-24">Role</TableHead>
                  <TableHead className="w-40">Department</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32 text-center">Assets</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => setDetailsUser(user)}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} />
                          <div className="min-w-0">
                            <p className="truncate text-base font-medium">
                              {user.name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{user.department}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>

                      <TableCell className="text-center">
                        {user.assignedAssets > 0 ? (
                          <span className="text-base font-medium">
                            {user.assignedAssets}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No assets
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onUserAdded={handleUserAdded}
        generateUserId={generateUserId}
      />

      {/* View User Details Dialog */}
      <ViewUserDetailsDialog
        user={detailsUser}
        open={detailsUser !== null}
        onOpenChange={(open) => { if (!open) setDetailsUser(null); }}
        onEditUser={(user) => {
          setDetailsUser(null);
          setEditUser(user as UserItem);
        }}
        onViewAssets={(user) => {
          setDetailsUser(null);
          handleViewAssets(user as UserItem);
        }}
        onUserUpdated={(updatedUser) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === updatedUser.id ? { ...u, ...updatedUser } : u
            )
          );
          setDetailsUser(null);
        }}
        onUserDeleted={(userId) => {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setDetailsUser(null);
        }}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editUser}
        open={editUser !== null}
        onOpenChange={(open) => { if (!open) setEditUser(null); }}
        onUserUpdated={handleUserUpdated}
      />

      {/* View Assigned Assets Dialog */}
      <ViewAssignedAssetsDialog
        userName={assetsUser?.name ?? ""}
        assets={assignedAssets}
        loading={assetsLoading}
        open={assetsUser !== null}
        onOpenChange={(open) => { if (!open) setAssetsUser(null); }}
        onNavigateToAsset={handleNavigateToAsset}
        onBackToDetails={
          assetsUser
            ? () => {
                const user = assetsUser;
                setAssetsUser(null);
                setDetailsUser(user);
              }
            : undefined
        }
      />
    </div>
  );
}