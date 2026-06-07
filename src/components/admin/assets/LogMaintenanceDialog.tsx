"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Wrench } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { logMaintenance, type LogMaintenancePayload } from "./assetService";
import type { Asset } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onSaved: () => void;
};

export default function LogMaintenanceDialog({ open, onOpenChange, asset, onSaved }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    cost_amount: "",
    odometer_reading: asset.current_mileage ? String(asset.current_mileage) : "",
    next_service_date: "",
  });

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setForm({
        title: "",
        description: "",
        cost_amount: "",
        odometer_reading: asset.current_mileage ? String(asset.current_mileage) : "",
        next_service_date: "",
      });
    }
  }, [open, asset]);

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Missing title", { description: "Please provide a maintenance title." });
      return;
    }

    const cost = Number(form.cost_amount);
    if (isNaN(cost) || cost < 0) {
      toast.error("Invalid cost", { description: "Cost cannot be negative." });
      return;
    }

    const odometer = Number(form.odometer_reading);
    if (isNaN(odometer) || odometer < 0) {
      toast.error("Invalid odometer", { description: "Odometer reading must be a valid number." });
      return;
    }

    if (asset.current_mileage && odometer < asset.current_mileage) {
      toast.error("Invalid odometer", { description: "Odometer cannot be less than the current mileage." });
      return;
    }

    const payload: LogMaintenancePayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      cost_amount: cost,
      odometer_reading: odometer,
      next_service_date: form.next_service_date || undefined,
    };

    setSubmitting(true);
    try {
      await logMaintenance(asset.id, payload);
      toast.success("Maintenance Logged", {
        description: `Successfully logged maintenance for ${asset.asset_code}`,
      });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to log maintenance", {
        description: err.message || "An error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wrench className="h-5 w-5" />
            Log Maintenance
          </DialogTitle>
          <DialogDescription>
            Record a completed service for {asset.asset_code}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 pt-1">
          <Field label="Service Title *">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Engine Oil Replacement"
              required
            />
          </Field>

          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details about the service"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Total Cost (LKR) *">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.cost_amount}
                onChange={(e) => set("cost_amount", e.target.value)}
                placeholder="0.00"
                required
              />
            </Field>

            <Field label="Odometer Reading *">
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.odometer_reading}
                onChange={(e) => set("odometer_reading", e.target.value)}
                placeholder={asset.current_mileage ? String(asset.current_mileage) : "0"}
                required
              />
            </Field>
          </div>

          <Field label="Next Scheduled Service Date">
            <Input
              type="date"
              value={form.next_service_date}
              onChange={(e) => set("next_service_date", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Log Maintenance"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
