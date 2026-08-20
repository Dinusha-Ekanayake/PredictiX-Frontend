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
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import type {
  UserItem,
  UserRole,
  UserStatus,
  CreateUserPayload,
} from "@/lib/userService";
import { fetchDepartments, fetchWarehouses } from "@/lib/api/userProfileApi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
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
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [warehouse, setWarehouse] = React.useState("");
  const [role, setRole] = React.useState<UserRole | "">("");
  const [department, setDepartment] = React.useState("");
  const [status, setStatus] = React.useState<UserStatus | "">("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [departments, setDepartments] = React.useState<string[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = React.useState(false);
  const [warehouses, setWarehouses] = React.useState<string[]>([]);
  const [warehousesLoading, setWarehousesLoading] = React.useState(false);
  const [listsLoadFailed, setListsLoadFailed] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setDepartmentsLoading(true);
    setWarehousesLoading(true);
    setListsLoadFailed(false);
    fetchDepartments()
      .then(setDepartments)
      .catch(() => setListsLoadFailed(true))
      .finally(() => setDepartmentsLoading(false));
    fetchWarehouses()
      .then(setWarehouses)
      .catch(() => setListsLoadFailed(true))
      .finally(() => setWarehousesLoading(false));
  }, [open]);

  React.useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPassword("");
      setShowPassword(false);
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
    if (password && password.length < 8)
      errs.password = "Password must be at least 8 characters.";
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
      const payload: Partial<CreateUserPayload> = {
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
      };

      // Only send password if admin filled it in
      if (password.trim()) {
        payload.password = password.trim();
      }

      await onUserUpdated(user.id, payload);
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
              placeholder="e.g. nuwan.mech@lankalogix.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((p) => ({ ...p, email: undefined }));
              }}
              className="bg-background"
            />
          </FieldCard>

          {/* Password reset, optional */}
          <FieldCard
            icon={KeyRound}
            label="Reset Password (optional)"
            htmlFor="edit-password"
            error={errors.password}
          >
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                className="bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
              disabled={departmentsLoading}
            >
              <SelectTrigger
                id="edit-department"
                className="w-full bg-background"
              >
                <SelectValue placeholder={departmentsLoading ? "Loading…" : "Select department"} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
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
              disabled={warehousesLoading}
            >
              <SelectTrigger
                id="edit-warehouse"
                className="w-full bg-background"
              >
                <SelectValue placeholder={warehousesLoading ? "Loading…" : "Select warehouse"} />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
                <SelectItem value="Not assigned">Not assigned</SelectItem>
              </SelectContent>
            </Select>
            {listsLoadFailed && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                Failed to load department/warehouse lists — try reopening this dialog.
              </p>
            )}
          </FieldCard>

          {/* Buttons */}
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