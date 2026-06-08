"use client";

import * as React from "react";
import { toast } from "sonner";
import { updateUser } from "@/lib/api/userProfileApi";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Mail, Building2, ShieldCheck, Phone, MapPin } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "admin" | "user";
type UserStatus = "active" | "inactive";

export type ViewUser = {
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

type Props = {
  user: ViewUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user clicks "View Assigned Assets" to navigate to the assets dialog. */
  onViewAssets?: (user: ViewUser) => void;
  /** Called after a successful status change or edit. */
  onUserUpdated?: () => void;
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
  onUserUpdated,
}: Props) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!user) return null;

  async function handleToggleStatus() {
    setIsUpdating(true);
    const newStatus = user!.status === "active" ? "inactive" : "active";
    try {
      await updateUser(user!.id, { status: newStatus });
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"}`, {
        description: `${user!.name}'s account status has been updated.`,
      });
      if (onUserUpdated) onUserUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update status", {
        description: err instanceof Error ? err.message : "An error occurred while communicating with PostgreSQL.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  function handleEditUser() {
    toast.info(`Edit user: ${user!.name}`, {
      description: "Direct editing is being enabled via partial updates.",
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
          <InfoCard icon={Phone} label="Contact Number" value={user.contactNumber} />
          <InfoCard icon={MapPin} label="Residence Address" value={user.address} />
          <InfoCard icon={Building2} label="Warehouse" value={user.warehouse} />
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
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              user.status === "active" ? "Deactivate" : "Activate"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
