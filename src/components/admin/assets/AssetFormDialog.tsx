"use client";

import * as React from "react";
import { toast } from "@/lib/customToast";
import Image from "next/image";
import { Loader2, Boxes, Upload, X, Image as ImageIcon } from "lucide-react";

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
  uploadAssetImage,
  getWarehouseOptions,
  getDepartmentOptions,
  type AssetWritePayload,
  type IdNameOption,
} from "./assetService";
import type { Asset } from "./types";

const STATUS_OPTIONS = ["active", "inactive", "under_maintenance", "critical", "decommissioned"];
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

/** Dialog for creating an asset or editing an existing one, including its photos. */
export default function AssetFormDialog({ open, onOpenChange, asset, onSaved }: Props) {
  const isEdit = !!asset;
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [warehouses, setWarehouses] = React.useState<IdNameOption[]>([]);
  const [departments, setDepartments] = React.useState<IdNameOption[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [existingImages, setExistingImages] = React.useState<string[]>([]);

  // Object URLs are only freed by an explicit revokeObjectURL call. This ref
  // mirrors the latest previews so any code clearing the array can revoke the
  // exact URLs it is discarding, without closing over stale state.
  const imagePreviewsRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    imagePreviewsRef.current = imagePreviews;
  }, [imagePreviews]);

  // Revoke whatever's still held if the dialog unmounts entirely (e.g. the
  // parent page navigates away) without going through the reset effect below.
  React.useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Load options + reset form when the dialog opens
  React.useEffect(() => {
    if (!open) return;
    setForm(asset ? fromAsset(asset) : EMPTY);

    // Check if asset has existing image(s)
    const existing = asset?.meta?.images || [];
    const legacy = asset?.meta?.image_url;
    let allExisting = [...existing];
    if (legacy && !allExisting.includes(legacy)) {
      allExisting.unshift(legacy);
    }

    setExistingImages(allExisting);
    // Free the previous session's preview URLs before starting a new one,
    // otherwise each image added or removed leaks one for the page's lifetime.
    imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setImageFiles([]);

    getWarehouseOptions().then(setWarehouses).catch(() => setWarehouses([]));
    getDepartmentOptions().then(setDepartments).catch(() => setDepartments([]));
  }, [open, asset]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error("Some files too large", { description: "Each image must be under 5MB" });
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  }

  function removeNewImage(index: number) {
    const removedUrl = imagePreviewsRef.current[index];
    if (removedUrl) URL.revokeObjectURL(removedUrl);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

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
      let saved = isEdit
        ? await updateAsset(asset!.id, payload)
        : await createAsset(payload);
        
      if (imageFiles.length > 0) {
        toast.info(`Uploading ${imageFiles.length} image(s)...`, { duration: 2000 });
        for (const file of imageFiles) {
          saved = await uploadAssetImage(saved.id, file);
        }
      }
        
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
          {/* Image Upload Section */}
          <div className="flex flex-col p-4 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 group">
            <div className="flex flex-col items-center justify-center text-center mb-4">
              <div className="mx-auto w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2">
                <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-medium">Asset Images</p>
              <p className="text-xs text-muted-foreground mb-3">Add multiple PNG/JPG up to 5MB</p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </div>

            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                {/* Existing Images (Read-only) */}
                {existingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative w-16 h-16 rounded-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 opacity-80">
                    <Image src={url} alt={`Existing ${idx}`} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                ))}
                
                {/* New Images */}
                {imagePreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative w-16 h-16 rounded-md overflow-hidden ring-2 ring-indigo-500/50">
                    <Image src={preview} alt={`New ${idx}`} width={64} height={64} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      aria-label={`Remove image ${idx + 1}`}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Asset Code *" htmlFor="asset-code">
              <Input id="asset-code" value={form.asset_code} onChange={(e) => set("asset_code", e.target.value)}
                placeholder="e.g. SLW1234" disabled={isEdit} />
            </Field>
            <Field label="Asset Name *" htmlFor="asset-name">
              <Input id="asset-name" value={form.asset_name} onChange={(e) => set("asset_name", e.target.value)}
                placeholder="e.g. Forklift FL-22" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Warehouse *" htmlFor="asset-warehouse">
              <Select value={form.warehouse_id} onValueChange={(v) => set("warehouse_id", v)}>
                <SelectTrigger id="asset-warehouse" className="w-full"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Department" htmlFor="asset-department">
              <Select value={form.department_id} onValueChange={(v) => set("department_id", v)}>
                <SelectTrigger id="asset-department" className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Asset Type" htmlFor="asset-type">
              <Input id="asset-type" value={form.asset_type} onChange={(e) => set("asset_type", e.target.value)} placeholder="vehicle" />
            </Field>
            <Field label="Category" htmlFor="asset-category">
              <Input id="asset-category" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Forklift" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Make" htmlFor="asset-make">
              <Input id="asset-make" value={form.make} onChange={(e) => set("make", e.target.value)} />
            </Field>
            <Field label="Model" htmlFor="asset-model">
              <Input id="asset-model" value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Manufacture Year" htmlFor="asset-manufacture-year">
              <Input id="asset-manufacture-year" type="number" value={form.manufacture_year} onChange={(e) => set("manufacture_year", e.target.value)} placeholder="2022" />
            </Field>
            <Field label="Reg. Number" htmlFor="asset-registration-number">
              <Input id="asset-registration-number" value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
            </Field>
            <Field label="VIN" htmlFor="asset-vin">
              <Input id="asset-vin" value={form.vin} onChange={(e) => set("vin", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status" htmlFor="asset-status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger id="asset-status" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Health Band" htmlFor="asset-health-band">
              <Select value={form.health_band} onValueChange={(v) => set("health_band", v)}>
                <SelectTrigger id="asset-health-band" className="w-full"><SelectValue placeholder="Not set" /></SelectTrigger>
                <SelectContent>
                  {HEALTH_BANDS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description" htmlFor="asset-description">
            <Input id="asset-description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional notes" />
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

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
