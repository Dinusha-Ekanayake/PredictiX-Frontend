"use client";

import * as React from "react";
import { toast } from "@/lib/customToast";

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
  UserCog,
} from "lucide-react";

import type {
  UserItem,
  UserRole,
  UserStatus,
  CreateUserPayload,
} from "@/lib/userService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
};

type Props = {
  user: UserItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (
    userId: string,
    updatedFields: Partial<CreateUserPayload>
  ) => Promise<void>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
        <Label
          htmlFor={htmlFor}
          className="text-sm font-normal text-muted-foreground"
        >
          {label}
        </Label>
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
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

  // Populate fields when dialog opens
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
    else if (!validateEmail(email.trim()))
      errs.email = "Please enter a valid email address.";
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
        email: email.trim().toLowerCase(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        warehouse,
        role: role as UserRole,
        department,
        status: status as UserStatus,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update user", {
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
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
            <UserCog className="h-5 w-5" />
            Edit user
          </DialogTitle>
          <DialogDescription>
            Update the details for{" "}
            {user
              ? `${user.firstName} ${user.lastName}`.trim() || user.email
              : "this user"}{" "}
            below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-1">
          {/* First Name */}
          <FieldCard
            icon={User}
            label="First Name"
            htmlFor="edit-first-name"
            error={errors.firstName}
          >
            <Input
              id="edit-first-name"
              placeholder="e.g. Jane"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName)
                  setErrors((p) => ({ ...p, firstName: undefined }));
              }}
              aria-invalid={!!errors.firstName}
              className="bg-background"
            />
          </FieldCard>

          {/* Last Name */}
          <FieldCard
            icon={User}
            label="Last Name"
            htmlFor="edit-last-name"
            error={errors.lastName}
          >
            <Input
              id="edit-last-name"
              placeholder="e.g. Cooper"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName)
                  setErrors((p) => ({ ...p, lastName: undefined }));
              }}
              aria-invalid={!!errors.lastName}
              className="bg-background"
            />
          </FieldCard>

          {/* Email */}
          <FieldCard
            icon={Mail}
            label="Email Address"
            htmlFor="edit-email"
            error={errors.email}
          >
            <Input
              id="edit-email"
              type="email"
              placeholder="e.g. jane.cooper@warehouse.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((p) => ({ ...p, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              className="bg-background"
            />
          </FieldCard>

          {/* Role & Status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldCard
              icon={Shield}
              label="Role"
              htmlFor="edit-role"
              error={errors.role}
            >
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as UserRole);
                  if (errors.role)
                    setErrors((p) => ({ ...p, role: undefined }));
                }}
              >
                <SelectTrigger
                  id="edit-role"
                  aria-invalid={!!errors.role}
                  className="w-full bg-background"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </FieldCard>

            <FieldCard
              icon={ShieldCheck}
              label="Status"
              htmlFor="edit-status"
              error={errors.status}
            >
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as UserStatus);
                  if (errors.status)
                    setErrors((p) => ({ ...p, status: undefined }));
                }}
              >
                <SelectTrigger
                  id="edit-status"
                  aria-invalid={!!errors.status}
                  className="w-full bg-background"
                >
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
          <FieldCard
            icon={Building2}
            label="Department"
            htmlFor="edit-department"
            error={errors.department}
          >
            <Select
              value={department}
              onValueChange={(v) => {
                setDepartment(v);
                if (errors.department)
                  setErrors((p) => ({ ...p, department: undefined }));
              }}
            >
              <SelectTrigger
                id="edit-department"
                aria-invalid={!!errors.department}
                className="w-full bg-background"
              >
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Administrative">Administrative</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </FieldCard>

          {/* Residence Address */}
          <FieldCard
            icon={Building2}
            label="Residence Address"
            htmlFor="edit-address"
          >
            <Input
              id="edit-address"
              placeholder="e.g. No. 10, Example Road, Colombo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background"
            />
          </FieldCard>

          {/* Contact Number */}
          <FieldCard
            icon={ShieldCheck}
            label="Contact Number"
            htmlFor="edit-contact"
          >
            <Input
              id="edit-contact"
              type="tel"
              placeholder="e.g. 0712345678"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="bg-background"
            />
          </FieldCard>

          {/* Warehouse */}
          <FieldCard
            icon={Building2}
            label="Warehouse"
            htmlFor="edit-warehouse"
          >
            <Select
              value={warehouse}
              onValueChange={(v) => setWarehouse(v)}
            >
              <SelectTrigger
                id="edit-warehouse"
                className="w-full bg-background"
              >
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LankaLogix - Colombo">
                  LankaLogix - Colombo
                </SelectItem>
                <SelectItem value="Main Branch - Colombo">
                  Main Branch - Colombo
                </SelectItem>
                <SelectItem value="Galle">Galle</SelectItem>
                <SelectItem value="Not assigned">Not assigned</SelectItem>
              </SelectContent>
            </Select>
          </FieldCard>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Save changes
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