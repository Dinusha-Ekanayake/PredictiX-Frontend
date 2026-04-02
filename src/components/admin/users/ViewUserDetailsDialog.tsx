"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Mail, Building2, ShieldCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "admin" | "user";
type UserStatus = "active" | "inactive";

export type ViewUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  assignedAssets: number;
};

type Props = {
  user: ViewUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user clicks "View Assigned Assets" to navigate to the assets dialog. */
  onViewAssets?: (user: ViewUser) => void;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Single info row — icon + label + value inside a dark rounded card. */
function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-muted/50 px-4 py-3.5">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  );
}

/** Highlighted card for assigned assets with a teal border. */
function AssetsCard({
  count,
  onViewAssets,
}: {
  count: number;
  onViewAssets: () => void;
}) {
  return (
    <div className="rounded-xl border border-teal-500/40 bg-muted/50 px-4 py-3.5">
      <p className="text-base font-semibold text-teal-400">Assigned Assets</p>
      <p className="mt-0.5 text-sm text-teal-400">
        {count} asset{count !== 1 ? "s" : ""} currently assigned
      </p>
      <button
        type="button"
        onClick={onViewAssets}
        className="mt-1.5 text-sm font-medium text-teal-400 underline underline-offset-2 hover:text-teal-300"
      >
        View Assigned Assets
      </button>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "admin") {
    return (
      <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
        admin
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-teal-600 text-white hover:bg-teal-600">
      user
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export default function ViewUserDetailsDialog({
  user,
  open,
  onOpenChange,
  onViewAssets,
}: Props) {
  if (!user) return null;

  function handleEditUser() {
    toast.info(`Edit user: ${user!.name}`, {
      description: "Edit functionality will be available when the backend is ready.",
    });
  }

  function handleDeactivate() {
    toast.warning(`Deactivate ${user!.name}?`, {
      description: "Deactivation will be available when the backend is ready.",
    });
  }

  function handleViewAssets() {
    if (onViewAssets) {
      onViewAssets(user!);
    } else {
      toast.info(`Viewing assets for ${user!.name}`, {
        description: `${user!.assignedAssets} asset(s) assigned.`,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{user.name}</DialogTitle>
          <div className="pt-1">
            <RoleBadge role={user.role} />
          </div>
        </DialogHeader>

        {/* Info cards */}
        <div className="grid gap-3 pt-1">
          <InfoCard icon={Mail} label="Email" value={user.email} />
          <InfoCard icon={Building2} label="Department" value={user.department} />
          <InfoCard icon={ShieldCheck} label="Status" value={user.status} />
        </div>

        {/* Assigned assets highlight card */}
        <AssetsCard count={user.assignedAssets} onViewAssets={handleViewAssets} />

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button onClick={handleEditUser} className="w-full">
            Edit User
          </Button>
          <Button
            variant="secondary"
            onClick={handleDeactivate}
            className="w-full"
          >
            {user.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
