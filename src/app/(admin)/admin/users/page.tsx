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
  Users,
  UserCheck,
  Shield,
  UserRound,
  UserPlus,
  Search,
  Building2,
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
  name: string;
  email: string;
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
    id: "USR-001",
    name: "John Smith",
    email: "john.smith@warehouse.com",
    role: "user",
    department: "Operations",
    status: "active",
    assignedAssets: 3,
  },
  {
    id: "USR-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@warehouse.com",
    role: "admin",
    department: "Management",
    status: "active",
    assignedAssets: 0,
  },
  {
    id: "USR-003",
    name: "Mike Davis",
    email: "mike.davis@warehouse.com",
    role: "user",
    department: "Operations",
    status: "active",
    assignedAssets: 2,
  },
  {
    id: "USR-004",
    name: "Emily Chen",
    email: "emily.chen@warehouse.com",
    role: "user",
    department: "Engineering",
    status: "active",
    assignedAssets: 5,
  },
  {
    id: "USR-005",
    name: "David Wilson",
    email: "david.wilson@warehouse.com",
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
  const [users, setUsers] = React.useState<UserItem[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [detailsUser, setDetailsUser] = React.useState<UserItem | null>(null);
  const [assetsUser, setAssetsUser] = React.useState<UserItem | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
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

            <Button onClick={() => setIsAddDialogOpen(true)}>
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

                      <TableCell>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="text-sm font-medium text-teal-400 hover:text-teal-300"
                          >
                            View Details
                          </button>
                          {user.assignedAssets > 0 && (
                            <button
                              onClick={() => handleViewAssets(user)}
                              className="text-sm font-medium text-teal-400 hover:text-teal-300"
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

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onUserAdded={handleUserAdded}
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
