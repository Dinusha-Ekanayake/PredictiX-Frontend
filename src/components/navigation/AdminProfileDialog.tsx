"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  Mail,
  Building2,
  Warehouse,
  ShieldCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "ADMIN" | "USER";

export type AdminProfile = {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  assignedWarehouse: string;
};

type Props = {
  admin: AdminProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({
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

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge
      className={
        role === "ADMIN"
          ? "border-transparent bg-violet-600 text-white hover:bg-violet-600"
          : "border-transparent bg-teal-600 text-white hover:bg-teal-600"
      }
    >
      {role === "ADMIN" ? "Admin" : "User"}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export default function AdminProfileDialog({
  admin,
  open,
  onOpenChange,
}: Props) {
  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div
              className="grid place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 font-semibold text-white h-12 w-12 text-base"
            >
              {(() => {
                const parts = admin.name.trim().split(/\s+/).filter(Boolean);
                if (parts.length === 0) return "A";
                if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "A";
                return (
                  (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
                ).toUpperCase();
              })()}
            </div>
            <div>
              <span className="block">{admin.name}</span>
              <RoleBadge role={admin.role} />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 pt-1">
          <InfoRow icon={Mail} label="Email" value={admin.email} />
          <InfoRow
            icon={Warehouse}
            label="Assigned Warehouse"
            value={admin.assignedWarehouse}
          />
          <InfoRow icon={Building2} label="Department" value={admin.department} />
          <InfoRow
            icon={ShieldCheck}
            label="Role"
            value={admin.role === "ADMIN" ? "Administrator" : "User"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
