"use client";

import * as React from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  assetId: string;
  assetName: string;
  hasAssignee: boolean;
  hasServiceDate: boolean;
};

export default function SendServiceReminderButton({
  assetId,
  assetName,
  hasAssignee,
  hasServiceDate,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const disabled = loading || !hasAssignee || !hasServiceDate;

  let title = "Send service reminder to assigned user";
  if (!hasAssignee) title = "No user assigned to this asset";
  else if (!hasServiceDate) title = "No service date set";

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") ?? localStorage.getItem("token")
          : null;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

      const res = await fetch(
        `${baseUrl}/assets/${assetId}/send-service-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.sent) {
        throw new Error(body?.detail || body?.error || "Failed to send reminder");
      }

      toast.success("Reminder sent", {
        description: `Email sent to ${body.to}${
          typeof body.days_remaining === "number"
            ? ` · ${body.days_remaining}d to service`
            : ""
        }`,
      });
    } catch (err: any) {
      toast.error("Failed to send reminder", {
        description: err?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={title}
      aria-label={`Send service reminder for ${assetName}`}
      className={cn(
        "inline-flex items-center justify-center h-6 w-6 rounded-md shrink-0",
        "text-teal-500 dark:text-teal-400",
        "hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-300",
        "disabled:text-slate-400 dark:disabled:text-slate-500",
        "disabled:hover:bg-transparent disabled:cursor-not-allowed",
        "transition-colors"
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Mail className="h-3.5 w-3.5" />
      )}
    </button>
  );
}