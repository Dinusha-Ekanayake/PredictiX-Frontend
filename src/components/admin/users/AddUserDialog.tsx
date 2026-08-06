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
  UserPlus,
  User,
  Mail,
  Shield,
  Building2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

import { createUser } from "@/lib/userService";
import type { UserRole, UserStatus } from "@/lib/userService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NewUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  address: string;
  contactNumber: string;
  warehouse: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  assignedAssets: number;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  address?: string;
  contactNumber?: string;
  warehouse?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
  status?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: (user: NewUser) => void;
  generateUserId: (role: UserRole, department: string) => string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEPARTMENTS = [
  "Transportation",
  "Mechanical",
  "Electrical",
  "Software",
  "Admin",
  "Administrative",
  "IT",
  "Maintenance",
] as const;

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

export default function AddUserDialog({
  open,
  onOpenChange,
  onUserAdded,
  generateUserId,
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

  React.useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setAddress("");
        setContactNumber("");
        setWarehouse("");
        setRole("");
        setDepartment("");
        setStatus("");
        setErrors({});
        setIsSubmitting(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(email.trim()))
      errs.email = "Please enter a valid email address.";
    if (!password.trim()) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (!role) errs.role = "Please select a role.";
    if (!department) errs.department = "Please select a department.";
    if (!status) errs.status = "Please select a status.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    if (!role || !department || !status) return;

    setIsSubmitting(true);

    try {
      const created = await createUser({
        id: generateUserId(role as UserRole, department),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        password: password,
        role: role as UserRole,
        status: status as UserStatus,
        department,
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        warehouse,
      });

      const newUser: NewUser = {
        id: created.id,
        firstName: created.firstName,
        lastName: created.lastName,
        name: created.name,
        address: created.address,
        contactNumber: created.contactNumber,
        warehouse: created.warehouse,
        email: created.email,
        role: created.role,
        department: created.department,
        status: created.status,
        assignedAssets: 0,
      };

      onUserAdded(newUser);
      onOpenChange(false);

      toast.success("User added successfully!", {
        description: `${newUser.name} (${newUser.email}) has been added as ${newUser.role}.`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to add user.", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new user account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-1">
          {/* First Name */}
          <FieldCard
            icon={User}
            label="First Name"
            htmlFor="add-first-name"
            error={errors.firstName}
          >
            <Input
              id="add-first-name"
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
            htmlFor="add-last-name"
            error={errors.lastName}
          >
            <Input
              id="add-last-name"
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
            htmlFor="add-email"
            error={errors.email}
          >
            <Input
              id="add-email"
              type="email"
              placeholder="e.g. jane.cooper@lankalogix.lk"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((p) => ({ ...p, email: undefined }));
              }}
              className="bg-background"
            />
          </FieldCard>

          {/* Password */}
          <FieldCard
            icon={KeyRound}
            label="Password"
            htmlFor="add-password"
            error={errors.password}
          >
            <div className="relative">
              <Input
                id="add-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
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
              htmlFor="add-role"
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
                <SelectTrigger id="add-role" className="w-full bg-background">
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
              htmlFor="add-status"
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
                <SelectTrigger id="add-status" className="w-full bg-background">
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
            htmlFor="add-department"
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
                id="add-department"
                className="w-full bg-background"
              >
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
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
            htmlFor="add-address"
          >
            <Input
              id="add-address"
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
            htmlFor="add-contact"
          >
            <Input
              id="add-contact"
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
            htmlFor="add-warehouse"
            error={errors.warehouse}
          >
            <Select
              value={warehouse}
              onValueChange={(v) => {
                setWarehouse(v);
                if (errors.warehouse)
                  setErrors((p) => ({ ...p, warehouse: undefined }));
              }}
            >
              <SelectTrigger
                id="add-warehouse"
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
              </SelectContent>
            </Select>
          </FieldCard>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
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