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
  Plus,
  Box,
  Settings,
  Activity,
  User,
  Building2,
  Calendar,
  Wrench,
  Tag,
  Hash,
  Zap,
} from "lucide-react";

import type { Asset, AssetStatus } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetAdded: (asset: Asset) => void;
};

type FormErrors = {
  name?: string;
  type?: string;
  warehouseId?: string;
  manufacturer?: string;
  serialNumber?: string;
};

// ---------------------------------------------------------------------------
// Sub-component: form field inside a styled card
// ---------------------------------------------------------------------------

function FieldCard({
  icon: Icon,
  label,
  htmlFor,
  error,
  children,
  required = false,
}: {
  icon: React.ElementType;
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3.5">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Label htmlFor={htmlFor} className="text-sm font-normal text-muted-foreground">
            {label}
          </Label>
        </div>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
            Must Fill
          </span>
        )}
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

export default function AddAssetDialog({
  open,
  onOpenChange,
  onAssetAdded,
}: Props) {
  // General Info
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [warehouseName, setWarehouseName] = React.useState("");

  // Usage Details
  const [machineAge, setMachineAge] = React.useState("");
  const [usageHours, setUsageHours] = React.useState("");
  const [lastMaintenanceDate, setLastMaintenanceDate] = React.useState("");
  const [maintenanceCount, setMaintenanceCount] = React.useState("");

  // Technical Details
  const [manufacturer, setManufacturer] = React.useState("");
  const [modelNumber, setModelNumber] = React.useState("");
  const [serialNumber, setSerialNumber] = React.useState("");
  const [powerType, setPowerType] = React.useState("");

  // Assignment
  const [assignedTo, setAssignedTo] = React.useState("");
  const [department, setDepartment] = React.useState("");

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setName("");
        setType("");
        setWarehouseId("");
        setWarehouseName("");
        setMachineAge("");
        setUsageHours("");
        setLastMaintenanceDate("");
        setMaintenanceCount("");
        setManufacturer("");
        setModelNumber("");
        setSerialNumber("");
        setPowerType("");
        setAssignedTo("");
        setDepartment("");
        setErrors({});
        setIsSubmitting(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Asset name is required.";
    if (!type.trim()) errs.type = "Asset type is required.";
    if (!warehouseId) errs.warehouseId = "Please select a warehouse.";
    if (!manufacturer.trim()) errs.manufacturer = "Manufacturer is required.";
    if (!serialNumber.trim()) errs.serialNumber = "Serial number is required.";
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

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));

    const newAsset: Asset = {
      id: `A-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generated ID
      name: name.trim(),
      type: type.trim(),
      description: `${type} by ${manufacturer}. Model: ${modelNumber}`,
      images: [],
      status: "OPERATIONAL",
      healthScore: 100, // New assets start at 100
      failureProbability8w: 0.05,
      predictionConfidence: 0.9,
      warehouse: { id: warehouseId, name: warehouseName },
      location: "General Receiving",
      assignedPerson: assignedTo ? { id: `U-${Math.floor(100 + Math.random() * 900)}`, name: assignedTo } : null,
      lastMaintenanceDate: lastMaintenanceDate || null,
      nextMaintenanceDate: null,
      scheduledMaintenanceDate: null,
      predictedMaintenanceDate: null,
      estimatedCost: 0,
      costVariance30d: 0,
      maintenanceLogs: [],
      assignmentHistory: [],
      auditTrail: [
        {
          id: `AT-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          field: "created",
          oldValue: "",
          newValue: "Asset created",
          by: { id: "admin-1", name: "Admin" },
        },
      ],
      technicalDetails: {
        manufacturer: manufacturer.trim(),
        modelNumber: modelNumber.trim(),
        serialNumber: serialNumber.trim(),
        powerType: powerType,
      },
      usageDetails: {
        machineAge: Number(machineAge) || 0,
        usageHours: Number(usageHours) || 0,
        maintenanceCount: Number(maintenanceCount) || 0,
      },
    };

    onAssetAdded(newAsset);
    onOpenChange(false);

    toast.success("Asset added successfully!", {
      description: `${newAsset.name} has been registered in ${newAsset.warehouse.name}.`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Plus className="h-6 w-6 text-primary" />
            Add New Asset
          </DialogTitle>
          <DialogDescription>
            Register a new asset in the system. Fill in all required details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Section: General Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              General Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard icon={Tag} label="Asset Name" htmlFor="asset-name" error={errors.name} required>
                <Input
                  id="asset-name"
                  placeholder="e.g. Forklift FL-50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Box} label="Asset Type" htmlFor="asset-type" error={errors.type} required>
                <Input
                  id="asset-type"
                  placeholder="e.g. Heavy Machinery"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>
            </div>

            <FieldCard icon={Building2} label="Warehouse" htmlFor="asset-warehouse" error={errors.warehouseId} required>
              <Select
                value={warehouseId}
                onValueChange={(v) => {
                  setWarehouseId(v);
                  const names: Record<string, string> = { "WH-A": "Warehouse A", "WH-B": "Warehouse B", "WH-C": "Warehouse C" };
                  setWarehouseName(names[v]);
                }}
              >
                <SelectTrigger id="asset-warehouse" className="bg-background">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WH-A">Warehouse A</SelectItem>
                  <SelectItem value="WH-B">Warehouse B</SelectItem>
                  <SelectItem value="WH-C">Warehouse C</SelectItem>
                </SelectContent>
              </Select>
            </FieldCard>
          </div>

          {/* Section: Usage Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Usage Details
              <span className="ml-2 text-[10px] font-normal lowercase tracking-normal">Optional</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard icon={Activity} label="Machine Age (Years)">
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={machineAge}
                  onChange={(e) => setMachineAge(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Activity} label="Usage Hours">
                <Input
                  type="number"
                  placeholder="e.g. 1200"
                  value={usageHours}
                  onChange={(e) => setUsageHours(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Calendar} label="Last Maintenance">
                <Input
                  type="date"
                  value={lastMaintenanceDate}
                  onChange={(e) => setLastMaintenanceDate(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Wrench} label="Maint. Count">
                <Input
                  type="number"
                  placeholder="e.g. 4"
                  value={maintenanceCount}
                  onChange={(e) => setMaintenanceCount(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>
            </div>
          </div>

          {/* Section: Technical Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard icon={Settings} label="Manufacturer" error={errors.manufacturer} required>
                <Input
                  placeholder="e.g. Caterpillar"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Hash} label="Model Number">
                <Input
                  placeholder="e.g. CAT-988K"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Hash} label="Serial Number" error={errors.serialNumber} required>
                <Input
                  placeholder="e.g. SN-889021"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Zap} label="Power Type">
                <Select value={powerType} onValueChange={setPowerType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Fuel / Power" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="LPG">LPG</SelectItem>
                  </SelectContent>
                </Select>
              </FieldCard>
            </div>
          </div>

          {/* Section: Assignment */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Assignment
              <span className="ml-2 text-[10px] font-normal lowercase tracking-normal">Can skip</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard icon={User} label="Assigned To">
                <Input
                  placeholder="Employee Name"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>

              <FieldCard icon={Building2} label="Department">
                <Input
                  placeholder="e.g. Logistics"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-background"
                />
              </FieldCard>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" className="h-12 flex-1 text-base font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Adding Asset...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Register Asset
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-12 px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
