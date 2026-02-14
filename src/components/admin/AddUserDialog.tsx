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

import {
  Loader2,
  UserPlus,
  User,
  Mail,
  Shield,
  Building2,
  ShieldCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "admin" | "user";
type UserStatus = "active" | "inactive";

export type NewUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  assignedAssets: number;
};

type FormErrors = {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: (user: NewUser) => void;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEPARTMENTS = [
  "Operations",
  "Management",
  "Engineering",
  "Maintenance",
  "Quality Assurance",
  "IT",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `USR-${num}`;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------------
// Sub-component: form field inside a styled card
// ---------------------------------------------------------------------------

function FieldCard({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: React.ElementType;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3.5">
      <div className="flex items-center gap-3 pb-2">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
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

export default function AddUserDialog({ open, onOpenChange, onUserAdded }: Props) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole | "">("");
  const [department, setDepartment] = React.useState("");
  const [status, setStatus] = React.useState<UserStatus | "">("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setName("");
        setEmail("");
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
    if (!name.trim()) errs.name = "Full name is required.";
    else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(email.trim())) errs.email = "Please enter a valid email address.";
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
      toast.error("Please fix the errors in the form.", {
        description: "All fields are required to add a new user.",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const newUser: NewUser = {
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role as UserRole,
      department,
      status: status as UserStatus,
      assignedAssets: 0,
    };

    onUserAdded(newUser);
    onOpenChange(false);

    toast.success("User added successfully!", {
      description: `${newUser.name} (${newUser.email}) has been added as ${newUser.role}.`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
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
          {/* Full Name */}
          <FieldCard icon={User} label="Full Name" error={errors.name}>
            <Input
              id="add-user-name"
              placeholder="e.g. Jane Cooper"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              aria-invalid={!!errors.name}
              className="bg-background"
            />
          </FieldCard>

          {/* Email */}
          <FieldCard icon={Mail} label="Email Address" error={errors.email}>
            <Input
              id="add-user-email"
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
            <FieldCard icon={Shield} label="Role" error={errors.role}>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as UserRole);
                  if (errors.role) setErrors((p) => ({ ...p, role: undefined }));
                }}
              >
                <SelectTrigger aria-invalid={!!errors.role} className="w-full bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </FieldCard>

            <FieldCard icon={ShieldCheck} label="Status" error={errors.status}>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as UserStatus);
                  if (errors.status) setErrors((p) => ({ ...p, status: undefined }));
                }}
              >
                <SelectTrigger aria-invalid={!!errors.status} className="w-full bg-background">
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
          <FieldCard icon={Building2} label="Department" error={errors.department}>
            <Select
              value={department}
              onValueChange={(v) => {
                setDepartment(v);
                if (errors.department) setErrors((p) => ({ ...p, department: undefined }));
              }}
            >
              <SelectTrigger aria-invalid={!!errors.department} className="w-full bg-background">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldCard>

          {/* Action buttons */}
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
