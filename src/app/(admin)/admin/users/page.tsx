"use client";

import * as React from "react";

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
import type { AssetItem } from "@/components/admin/users/ViewAssignedAssetsDialog";
import { toast } from "sonner";

import {
  listUsers,
  createUser,
  getUserAssets,
  deleteUser,
  type UserItem,
  type UserRole,
  type UserStatus,
} from "@/lib/userService";

import {
  Users,
  UserCheck,
  Shield,
  UserRound,
  UserPlus,
  Search,
  Building2,
  Trash2,
} from "lucide-react";

/**
 * Admin Users Management Page (PredictiX)
 * Fetches real users from the backend /users API.
 */

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
// Sub-components: Badges (solid fills matching Figma)
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
  return (
    <Badge variant="secondary">inactive</Badge>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: User avatar
// ---------------------------------------------------------------------------

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [detailsUser, setDetailsUser] = React.useState<UserItem | null>(null);
  const [assetsUser, setAssetsUser] = React.useState<UserItem | null>(null);
  const [assignedAssets, setAssignedAssets] = React.useState<AssetItem[]>([]);
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
        if (!Number.isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
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
    return () => {
      cancelled = true;
    };
  }, []);

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

      return (
        matchesSearch && matchesRole && matchesDepartment && matchesStatus
      );
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

  function handleViewDetails(user: UserItem) {
    setDetailsUser(user);
  }

  async function handleDeleteUser(user: UserItem) {
    if (!confirm(`Delete ${user.name}? This removes their login and profile. This cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success("User deleted", { description: user.name });
    } catch (err) {
      toast.error("Failed to delete user", {
        description: err instanceof Error ? err.message : undefined,
      });
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
              <SelectTrigger className="w-35">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Administrative">Administrative</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setIsAddDialogOpen(true)} className="ml-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-60 pl-6">User</TableHead>
                  <TableHead className="w-25">Role</TableHead>
                  <TableHead className="w-40">Department</TableHead>
                  <TableHead className="w-25">Status</TableHead>
                  <TableHead className="w-35">Assigned Assets</TableHead>
                  <TableHead className="w-45">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
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
                        <div className="flex items-center gap-2 text-base">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {user.department}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>

                      <TableCell className="text-center text-base">
                        {user.assignedAssets}
                      </TableCell>

                      <TableCell className="pr-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
                          >
                            View Details
                          </button>
                          {user.assignedAssets > 0 && (
                            <button
                              onClick={() => handleViewAssets(user)}
                              className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
                            >
                              View Assets
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            title="Delete user"
                            className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
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
        onOpenChange={(open) => {
          if (!open) setDetailsUser(null);
        }}
        onViewAssets={(user) => {
          setDetailsUser(null);
          handleViewAssets(user);
        }}
      />

      {/* View Assigned Assets Dialog */}
      <ViewAssignedAssetsDialog
        userName={assetsUser?.name ?? ""}
        assets={assignedAssets}
        loading={assetsLoading}
        open={assetsUser !== null}
        onOpenChange={(open) => {
          if (!open) setAssetsUser(null);
        }}
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
