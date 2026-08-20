"use client";

import * as React from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { toast } from "@/lib/customToast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiClient";

type Props = {
  assetId: string;
  assetName: string;
  hasAssignee: boolean;
  hasServiceDate: boolean;
};

/** Button that emails the assigned user a reminder about an upcoming service. */
export default function SendServiceReminderButton({
  assetId,
  assetName,
  hasAssignee,
  hasServiceDate,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const disabled = !hasAssignee || !hasServiceDate;

  let disabledReason: string | null = null;
  if (!hasAssignee) disabledReason = "No user assigned to this asset";
  else if (!hasServiceDate) disabledReason = "No service date set";

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    setNote("");
    setOpen(true);
  }

  async function handleSend() {
    setLoading(true);
    try {
      const res = await apiFetch(`/assets/${assetId}/send-service-reminder`, {
        method: "POST",
        body: JSON.stringify({ note: note.trim() || null }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body?.sent) {
        throw new Error(body?.detail || body?.error || "Failed to send reminder");
      }

      toast.success("Reminder sent", {
        description: `Email sent to ${body.to}${
          typeof body.days_remaining === "number"
            ? ` · ${body.days_remaining}d to service`
            : ""
        }${note.trim() ? " · with admin note" : ""}`,
      });
      setOpen(false);
    } catch (err: any) {
      toast.error("Failed to send reminder", {
        description: err?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        title={disabledReason ?? "Send service reminder to assigned user"}
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
        <Mail className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Send service reminder</DialogTitle>
            <DialogDescription>
              An email will be sent to the user assigned to{" "}
              <span className="font-medium text-foreground">{assetName}</span>.
              You can optionally add a note to include in the email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <Label htmlFor="admin-note" className="text-sm">
              Note (optional)
            </Label>
            <textarea
              id="admin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please prioritize this — service was already missed once."
              rows={4}
              maxLength={1000}
              disabled={loading}
              className="
                w-full rounded-md border border-input bg-background px-3 py-2
                text-sm shadow-sm placeholder:text-muted-foreground
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                disabled:cursor-not-allowed disabled:opacity-50 resize-none
              "
            />
            <div className="text-[11px] text-muted-foreground text-right">
              {note.length}/1000
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
