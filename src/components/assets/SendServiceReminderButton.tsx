"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "@/lib/customToast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { sendServiceReminder } from "@/lib/api/assets";

type Props = {
  assetId: string;
  assetName: string;
  hasAssignee: boolean;
  hasServiceDate: boolean;
  isAdmin: boolean;
};

export function SendServiceReminderButton({
  assetId,
  assetName,
  hasAssignee,
  hasServiceDate,
  isAdmin,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  const disabled = !hasAssignee || !hasServiceDate || loading;

  let disabledReason: string | null = null;
  if (!hasAssignee) disabledReason = "No user assigned to this asset";
  else if (!hasServiceDate) disabledReason = "No service date set";

  async function handleClick() {
    setLoading(true);
    try {
      const result = await sendServiceReminder(assetId);
      toast.success("Reminder sent", {
        description: `Email sent to ${result.to} · ${result.days_remaining}d to service`,
      });
    } catch (err: any) {
      toast.error("Failed to send reminder", {
        description: err?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Send service reminder for ${assetName}`}
      className="
        inline-flex items-center justify-center
        h-7 w-7 rounded-md
        text-teal-400 hover:text-teal-300 hover:bg-teal-500/10
        disabled:text-slate-500 disabled:hover:bg-transparent
        disabled:cursor-not-allowed
        transition-colors
      "
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
    </button>
  );

  if (disabledReason) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{button}</span>
          </TooltipTrigger>
          <TooltipContent side="top">{disabledReason}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top">Send service reminder to assigned user</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
