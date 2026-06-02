"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Boxes } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createAsset,
  updateAsset,
  getWarehouseOptions,
  getDepartmentOptions,
  type AssetWritePayload,
  type IdNameOption,
} from "./assetService";
import type { Asset } from "./types";

const STATUS_OPTIONS = ["active", "inactive", "under_maintenance", "critical", "retired"];
const HEALTH_BANDS = ["excellent", "good", "moderate", "poor", "critical"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog is in EDIT mode; otherwise CREATE mode. */
  asset?: Asset | null;
  onSaved: (asset: Asset) => void;
};

type FormState = {
  asset_code: string;
  asset_name: string;
  warehouse_id: string;
  department_id: string;
  asset_type: string;
  category: string;
  vehicle_type: string;
  make: string;
  model: string;
  manufacture_year: string;
  registration_number: string;
  vin: string;
  status: string;
  health_band: string;
  description: string;
};

const EMPTY: FormState = {
  asset_code: "", asset_name: "", warehouse_id: "", department_id: "",
  asset_type: "vehicle", category: "", vehicle_type: "", make: "", model: "",
  manufacture_year: "", registration_number: "", vin: "", status: "active",
  health_band: "", description: "",
};

function fromAsset(a: Asset): FormState {
  return {
    asset_code: a.asset_code ?? "",
    asset_name: a.asset_name ?? "",
    warehouse_id: a.warehouse_id ?? "",
    department_id: a.department_id ?? "",
    asset_type: a.asset_type ?? "vehicle",
    category: a.category ?? "",
    vehicle_type: a.vehicle_type ?? "",
    make: a.make ?? "",
    model: a.model ?? "",
    manufacture_year: a.manufacture_year != null ? String(a.manufacture_year) : "",
    registration_number: a.registration_number ?? "",
    vin: a.vin ?? "",
    status: a.status ?? "active",
    health_band: a.health_band ?? "",
    description: a.description ?? "",
  };
}

export default function AssetFormDialog({ open, onOpenChange, asset, onSaved }: Props) {
  const isEdit = !!asset;
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [warehouses, setWarehouses] = React.useState<IdNameOption[]>([]);
  const [departments, setDepartments] = React.useState<IdNameOption[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Load options + reset form when the dialog opens
  React.useEffect(() => {
    if (!open) return;
    setForm(asset ? fromAsset(asset) : EMPTY);
    getWarehouseOptions().then(setWarehouses).catch(() => setWarehouses([]));
    getDepartmentOptions().then(setDepartments).catch(() => setDepartments([]));
  }, [open, asset]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_code.trim() || !form.asset_name.trim() || !form.warehouse_id) {
      toast.error("Missing required fields", {
        description: "Asset code, name, and warehouse are required.",
      });
      return;
    }

    const payload: AssetWritePayload = {
      asset_code: form.asset_code.trim(),
      asset_name: form.asset_name.trim(),
      warehouse_id: form.warehouse_id,
      department_id: form.department_id || null,
      asset_type: form.asset_type || "vehicle",
      category: form.category.trim() || null,
      vehicle_type: form.vehicle_type.trim() || null,
      make: form.make.trim() || null,
      model: form.model.trim() || null,
      manufacture_year: form.manufacture_year ? Number(form.manufacture_year) : null,
      registration_number: form.registration_number.trim() || null,
      vin: form.vin.trim() || null,
      status: form.status || "active",
      health_band: form.health_band || null,
      description: form.description.trim() || null,
    };

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await updateAsset(asset!.id, payload)
        : await createAsset(payload);
      toast.success(isEdit ? "Asset updated" : "Asset created", {
        description: saved.asset_name,
      });
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error(isEdit ? "Failed to update asset" : "Failed to create asset", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Boxes className="h-5 w-5" />
            {isEdit ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the asset details below." : "Fill in the details to register a new asset."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 pt-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Asset Code *">
              <Input value={form.asset_code} onChange={(e) => set("asset_code", e.target.value)}
                placeholder="e.g. SLW1234" disabled={isEdit} />
            </Field>
            <Field label="Asset Name *">
              <Input value={form.asset_name} onChange={(e) => set("asset_name", e.target.value)}
                placeholder="e.g. Forklift FL-22" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Warehouse *">
              <Select value={form.warehouse_id} onValueChange={(v) => set("warehouse_id", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Department">
              <Select value={form.department_id} onValueChange={(v) => set("department_id", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Asset Type">
              <Input value={form.asset_type} onChange={(e) => set("asset_type", e.target.value)} placeholder="vehicle" />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Forklift" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Make">
              <Input value={form.make} onChange={(e) => set("make", e.target.value)} />
            </Field>
            <Field label="Model">
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Manufacture Year">
              <Input type="number" value={form.manufacture_year} onChange={(e) => set("manufacture_year", e.target.value)} placeholder="2022" />
            </Field>
            <Field label="Reg. Number">
              <Input value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
            </Field>
            <Field label="VIN">
              <Input value={form.vin} onChange={(e) => set("vin", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Health Band">
              <Select value={form.health_band} onValueChange={(v) => set("health_band", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Not set" /></SelectTrigger>
                <SelectContent>
                  {HEALTH_BANDS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional notes" />
          </Field>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : isEdit ? "Save Changes" : "Create Asset"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting} className="w-full">
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
