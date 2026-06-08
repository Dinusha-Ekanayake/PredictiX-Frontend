"use client";

import React from "react";

interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

interface ScrollableTableProps {
  columns: TableColumn[];
  children: React.ReactNode;
  maxHeight?: string;
  title?: string;
}

export function ScrollableTable({
  columns,
  children,
  maxHeight = "600px",
  title,
}: ScrollableTableProps) {
  return (
    <div className="w-full border border-border rounded-lg bg-background overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}

      <div className="relative w-full">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-muted/50 border-b border-border">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width || "auto" }}
                    className="px-6 py-3 text-left text-sm font-semibold text-foreground"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable Body */}
        <div style={{ maxHeight, overflowY: "auto" }} className="w-full scrollbar-styled">
          <table className="w-full">
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function TableRow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer last:border-b-0"
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, width }: { children: React.ReactNode; width?: string }) {
  return (
    <td style={{ width }} className="px-6 py-4 text-sm text-foreground">
      {children}
    </td>
  );
}

// Avatar component for user initials
export function UserAvatar({ name, color = "bg-purple-500" }: { name: string; color?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
      {initials}
    </div>
  );
}

// Badge component for roles
export function RoleBadge({ role }: { role: string }) {
  const colors: { [key: string]: string } = {
    user: "bg-blue-500 text-white",
    admin: "bg-orange-500 text-white",
    warehouse: "bg-green-500 text-white",
    transportation: "bg-cyan-500 text-white",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[role.toLowerCase()] || "bg-gray-500 text-white"}`}>
      {role}
    </span>
  );
}

// Status indicator
export function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: string } = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    pending: "bg-yellow-500",
    disabled: "bg-red-500",
  };

  const statusColor = colors[status.toLowerCase()] || "bg-gray-500";

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
      <span className="text-sm capitalize">{status}</span>
    </div>
  );
}
