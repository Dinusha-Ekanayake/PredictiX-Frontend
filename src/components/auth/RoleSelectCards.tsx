"use client";

import * as React from "react";
import { Shield, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Role = "ADMIN" | "USER";

type Props = {
  value: Role | "";
  onChange: (role: Role) => void;
};

export default function RoleSelectCards({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RoleCard
        title="User"
        icon={<UserIcon className="h-5 w-5" />}
        selected={value === "USER"}
        onClick={() => onChange("USER")}
      />
      <RoleCard
        title="Admin"
        icon={<Shield className="h-5 w-5" />}
        selected={value === "ADMIN"}
        onClick={() => onChange("ADMIN")}
      />
    </div>
  );
}

function RoleCard({
  title,
  icon,
  selected,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border transition",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 dark:focus:ring-slate-700 dark:focus:ring-offset-slate-950",

        // Base (light)
        "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",

        // Base (dark)
        "dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:border-slate-700",

        // Selected
        selected &&
          "border-slate-900 bg-slate-50 text-slate-900 shadow-sm dark:border-slate-300 dark:bg-slate-800 dark:text-white"
      )}
    >
      <div
        className={cn(
          "transition",
          selected
            ? "text-slate-900 dark:text-white"
            : "text-slate-500 dark:text-slate-300"
        )}
      >
        {icon}
      </div>
      <div className="text-sm font-medium">{title}</div>
    </button>
  );
}
