"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
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
import ViewAssignedAssetsDialog, {
  getMockAssetsForUser,
} from "@/components/admin/users/ViewAssignedAssetsDialog";

import {
  Search,
  Building2,
  LayoutGrid,
  List,
  Users,
  Shield,
  UserCheck,
  UserPlus,
  UserRound,
} from "lucide-react";

/**
 * Admin Users Management Page (PredictiX)
 * Matches Figma spec exactly.
 * - Uses mock data now
 * - Replace mock data with API calls later (FastAPI)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "admin" | "user";
type UserStatus = "active" | "inactive";

type UserItem = {
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
};

// ---------------------------------------------------------------------------
// Initial mock data
// ---------------------------------------------------------------------------

const INITIAL_USERS: UserItem[] = [
  {
    id: "U0001O",
    firstName: "John",
    lastName: "Smith",
    name: "John Smith",
    email: "john.smith@warehouse.com",
    address: "No. 12, First Lane, Colombo",
    contactNumber: "0711234567",
    warehouse: "Main Branch - Colombo",
    role: "user",
    department: "Administrative",
    status: "active",
    assignedAssets: 3,
  },
  {
    id: "A0001M",
    firstName: "Sarah",
    lastName: "Johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@warehouse.com",
    address: "No. 22, Lake Road, Kandy",
    contactNumber: "0772345678",
    warehouse: "Main Branch - Colombo",
    role: "admin",
    department: "Mechanical",
    status: "active",
    assignedAssets: 0,
  },
  {
    id: "U0002M",
    firstName: "Mike",
    lastName: "Davis",
    name: "Mike Davis",
    email: "mike.davis@warehouse.com",
    address: "No. 5, Palm Gardens, Galle",
    contactNumber: "0753456789",
    warehouse: "Galle",
    role: "user",
    department: "Mechanical",
    status: "active",
    assignedAssets: 2,
  },
  {
    id: "U0003E",
    firstName: "Emily",
    lastName: "Chen",
    name: "Emily Chen",
    email: "emily.chen@warehouse.com",
    address: "No. 8, Rose Avenue, Colombo",
    contactNumber: "0724567890",
    warehouse: "Main Branch - Colombo",
    role: "user",
    department: "Electrical",
    status: "active",
    assignedAssets: 5,
  },
  {
    id: "U0004M",
    firstName: "David",
    lastName: "Wilson",
    name: "David Wilson",
    email: "david.wilson@warehouse.com",
    address: "No. 16, Temple Road, Galle",
    contactNumber: "0765678901",
    warehouse: "Galle",
    role: "user",
    department: "Maintenance",
    status: "inactive",
    assignedAssets: 1,
  },
];

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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: User Card (for Grid View)
// ---------------------------------------------------------------------------

function UserCard({
  user,
  onViewDetails,
  onViewAssets,
}: {
  user: UserItem;
  onViewDetails: (u: UserItem) => void;
  onViewAssets: (u: UserItem) => void;
}) {
  return (
    <Card className="group overflow-hidden rounded-2xl transition-all hover:shadow-lg dark:hover:shadow-emerald-900/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 transform transition-transform group-hover:scale-110">
            <UserAvatar name={user.name} />
          </div>
          <h3 className="line-clamp-1 text-lg font-bold">{user.name}</h3>
          <p className="mb-4 line-clamp-1 text-sm text-muted-foreground">
            {user.email}
          </p>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>

          <div className="mb-6 w-full space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-dashed pb-2">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono font-medium">{user.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-dashed pb-2">
              <span className="text-muted-foreground">Department</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {user.department}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assigned Assets</span>
              <span className="rounded-full bg-muted px-2 py-0.5 font-bold">
                {user.assignedAssets}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <button
              onClick={() => onViewDetails(user)}
              className="w-full rounded-full bg-emerald-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95"
            >
              View Details
            </button>
            {user.assignedAssets > 0 && (
              <button
                onClick={() => onViewAssets(user)}
                className="w-full rounded-full border border-emerald-600/30 py-2.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 active:scale-95"
              >
                View Assets
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminUsersPage() {
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [isLoading, setIsLoading] = React.useState(true);
  const [users, setUsers] = React.useState<UserItem[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [detailsUser, setDetailsUser] = React.useState<UserItem | null>(null);
  const [assetsUser, setAssetsUser] = React.useState<UserItem | null>(null);

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
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
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

  function handleUserAdded(newUser: NewUser) {
    setUsers((prev) => [newUser, ...prev]);
  }

  function handleViewDetails(user: UserItem) {
    setDetailsUser(user);
  }

  function handleViewAssets(user: UserItem) {
    setAssetsUser(user);
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
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
                <Icon className="h-8 w-8 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{k.value}</div>
              </CardContent>
            </Card>
          );
        })}
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
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 rounded-xl border bg-muted/50 p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${viewMode === "table"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                  }`}
                title="Table View"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${viewMode === "grid"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                  }`}
                title="Grid View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>

            <Button onClick={() => setIsAddDialogOpen(true)} className="ml-auto bg-emerald-600 hover:bg-emerald-500">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Rendering (Table or Grid) */}
      {viewMode === "table" ? (
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
                    <TableHead className="w-35 text-center">Assigned Assets</TableHead>
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
                                className="rounded-full border border-emerald-600 px-3 py-1 text-sm font-medium text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50"
                              >
                                View Assets
                              </button>
                            )}
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-muted text-muted-foreground">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onViewDetails={handleViewDetails}
                onViewAssets={handleViewAssets}
              />
            ))
          )}
        </div>
      )}

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
          setAssetsUser(user);
        }}
      />

      {/* View Assigned Assets Dialog */}
      <ViewAssignedAssetsDialog
        userName={assetsUser?.name ?? ""}
        assets={assetsUser ? getMockAssetsForUser(assetsUser.id) : []}
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
