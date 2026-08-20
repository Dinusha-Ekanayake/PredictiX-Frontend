"use client";

import * as React from "react";
import { toast } from "@/lib/customToast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Building2,
  ShieldCheck,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";

import { updateUser, deleteUser } from "@/lib/userService";
import type { UserItem, UserRole, UserStatus } from "@/lib/userService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewUser = UserItem;

type Props = {
  user: ViewUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewAssets?: (user: ViewUser) => void;
  onEditUser?: (user: ViewUser) => void;
  onUserUpdated?: (user: ViewUser) => void;
  onUserDeleted?: (userId: string) => void;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
        <p className="text-base font-semibold">{value || "—"}</p>
      </div>
    </div>
  );
}

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
      {count > 0 && (
        <button
          type="button"
          onClick={onViewAssets}
          className="mt-1.5 text-sm font-medium text-teal-400 underline underline-offset-2 hover:text-teal-300"
        >
          View Assigned Assets
        </button>
      )}
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
  onEditUser,
  onUserUpdated,
  onUserDeleted,
}: Props) {
  const [isToggling, setIsToggling] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!user) return null;

  function handleEditUser() {
    if (onEditUser) {
      onOpenChange(false);
      onEditUser(user!);
    }
  }

  async function handleToggleStatus() {
    if (!user) return;
    setIsToggling(true);
    try {
      const newStatus: UserStatus =
        user.status === "active" ? "inactive" : "active";
      const updated = await updateUser(user.id, { status: newStatus });
      toast.success(
        `User ${newStatus === "active" ? "activated" : "deactivated"} successfully.`
      );
      onUserUpdated?.({ ...user, ...updated, status: newStatus });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status.";
      toast.error("Status update failed.", { description: message });
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (
      !confirm(
        `Delete ${user.name}? This removes their login and cannot be undone.`
      )
    )
      return;
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success(`${user.name} has been deleted.`);
      onUserDeleted?.(user.id);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user.";
      toast.error("Delete failed.", { description: message });
    } finally {
      setIsDeleting(false);
    }
  }

  function handleViewAssets() {
    if (onViewAssets) onViewAssets(user!);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {user.name || "Unknown"}
          </DialogTitle>
          <div className="pt-1">
            <RoleBadge role={user.role} />
          </div>
        </DialogHeader>

        {/* Info cards */}
        <div className="grid gap-3 pt-1">
          <InfoCard icon={Mail} label="Email" value={user.email} />
          <InfoCard
            icon={Building2}
            label="Department"
            value={user.department}
          />
          <InfoCard icon={ShieldCheck} label="Status" value={user.status} />
          <InfoCard
            icon={Phone}
            label="Contact Number"
            value={user.contactNumber}
          />
          <InfoCard
            icon={MapPin}
            label="Residence Address"
            value={user.address}
          />
          <InfoCard
            icon={Building2}
            label="Warehouse"
            value={user.warehouse}
          />
        </div>

        {/* Assigned assets */}
        <AssetsCard
          count={user.assignedAssets}
          onViewAssets={handleViewAssets}
        />

        {/* Edit + Deactivate */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            onClick={handleEditUser}
            disabled={isToggling || isDeleting}
            className="w-full"
          >
            Edit user
          </Button>

          <Button
            variant="secondary"
            onClick={handleToggleStatus}
            disabled={isToggling || isDeleting}
            className="w-full"
          >
            {isToggling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : user.status === "active" ? (
              "Deactivate user"
            ) : (
              "Activate user"
            )}
          </Button>
        </div>

        {/* Delete, full width destructive */}
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting || isToggling}
          className="w-full"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete user"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}