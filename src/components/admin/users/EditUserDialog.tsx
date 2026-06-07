"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  Loader2,
  UserCheck,
  User,
  Mail,
  Shield,
  Building2,
  ShieldCheck,
  UserPen,
} from "lucide-react";
import type { UserItem, UserRole, UserStatus } from "@/lib/userService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormErrors = {
  firstName?: string;
  lastName?: string;
  address?: string;
  contactNumber?: string;
  warehouse?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
};

type Props = {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (userId: string, updatedFields: Partial<UserItem>) => Promise<void>;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEPARTMENTS = [
  "Administrative",
  "Mechanical",
  "Electrical",
  "IT",
  "Maintenance",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------------
// Sub-component: form field inside a styled card
// ---------------------------------------------------------------------------

function FieldCard({
  icon: Icon,
  label,
  htmlFor,
  error,
  children,
}: {
  icon: React.ElementType;
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3.5">
      <div className="flex items-center gap-3 pb-2">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <Label htmlFor={htmlFor} className="text-sm font-normal text-muted-foreground">
          {label}
        </Label>
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: Props) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [warehouse, setWarehouse] = React.useState("");
  const [role, setRole] = React.useState<UserRole | "">("");
  const [department, setDepartment] = React.useState("");
  const [status, setStatus] = React.useState<UserStatus | "">("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setAddress(user.address || "");
      setContactNumber(user.contactNumber || "");
      setWarehouse(user.warehouse || "");
      setRole(user.role || "");
      setDepartment(user.department || "");
      setStatus(user.status || "");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, user]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(email.trim())) errs.email = "Please enter a valid email address.";
    if (!address.trim()) errs.address = "Residence address is required.";
    if (!contactNumber.trim()) errs.contactNumber = "Contact number is required.";
    if (!warehouse) errs.warehouse = "Please select a warehouse.";
    if (!role) errs.role = "Please select a role.";
    if (!department) errs.department = "Please select a department.";
    if (!status) errs.status = "Please select a status.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onUserUpdated(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        warehouse,
        email: email.trim().toLowerCase(),
        role: role as UserRole,
        department,
        status: status as UserStatus,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update user", {
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPen className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update the details for this user below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-1">
          {/* First Name */}
          <FieldCard icon={User} label="First Name" htmlFor="edit-user-first-name" error={errors.firstName}>
            <Input
              id="edit-user-first-name"
              placeholder="e.g. Jane"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
              }}
              aria-invalid={!!errors.firstName}
              className="bg-background"
            />
          </FieldCard>

          {/* Last Name */}
          <FieldCard icon={User} label="Last Name" htmlFor="edit-user-last-name" error={errors.lastName}>
            <Input
              id="edit-user-last-name"
              placeholder="e.g. Cooper"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined }));
              }}
              aria-invalid={!!errors.lastName}
              className="bg-background"
            />
          </FieldCard>

          {/* Email */}
          <FieldCard icon={Mail} label="Email Address" htmlFor="edit-user-email" error={errors.email}>
            <Input
              id="edit-user-email"
              type="email"
              placeholder="e.g. jane.cooper@warehouse.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              className="bg-background"
            />
          </FieldCard>

          {/* Role & Status side by side */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldCard icon={Shield} label="Role" htmlFor="edit-user-role" error={errors.role}>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as UserRole);
                  if (errors.role) setErrors((p) => ({ ...p, role: undefined }));
                }}
              >
                <SelectTrigger id="edit-user-role" aria-invalid={!!errors.role} className="w-full bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </FieldCard>

            <FieldCard icon={ShieldCheck} label="Status" htmlFor="edit-user-status" error={errors.status}>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as UserStatus);
                  if (errors.status) setErrors((p) => ({ ...p, status: undefined }));
                }}
              >
                <SelectTrigger id="edit-user-status" aria-invalid={!!errors.status} className="w-full bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FieldCard>
          </div>

          {/* Department */}
          <FieldCard icon={Building2} label="Department" htmlFor="edit-user-department" error={errors.department}>
            <Select
              value={department}
              onValueChange={(v) => {
                setDepartment(v);
                if (errors.department) setErrors((p) => ({ ...p, department: undefined }));
              }}
            >
              <SelectTrigger id="edit-user-department" aria-invalid={!!errors.department} className="w-full bg-background">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldCard>

          {/* Residence Address */}
          <FieldCard icon={Building2} label="Residence Address" htmlFor="edit-user-address" error={errors.address}>
            <Input
              id="edit-user-address"
              placeholder="e.g. No. 10, Example Road, Colombo"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
              }}
              aria-invalid={!!errors.address}
              className="bg-background"
            />
          </FieldCard>

          {/* Contact Number */}
          <FieldCard icon={ShieldCheck} label="Contact Number" htmlFor="edit-user-contact" error={errors.contactNumber}>
            <Input
              id="edit-user-contact"
              type="tel"
              placeholder="e.g. 0712345678"
              value={contactNumber}
              onChange={(e) => {
                setContactNumber(e.target.value);
                if (errors.contactNumber)
                  setErrors((p) => ({ ...p, contactNumber: undefined }));
              }}
              aria-invalid={!!errors.contactNumber}
              className="bg-background"
            />
          </FieldCard>

          {/* Warehouse Name */}
          <FieldCard icon={Building2} label="Warehouse" htmlFor="edit-user-warehouse" error={errors.warehouse}>
            <Select
              value={warehouse}
              onValueChange={(v) => {
                setWarehouse(v);
                if (errors.warehouse) setErrors((p) => ({ ...p, warehouse: undefined }));
              }}
            >
              <SelectTrigger id="edit-user-warehouse" aria-invalid={!!errors.warehouse} className="w-full bg-background">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Branch - Colombo">Main Branch - Colombo</SelectItem>
                <SelectItem value="Galle">Galle</SelectItem>
              </SelectContent>
            </Select>
          </FieldCard>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
