"use client";

import SectionCard from "@/components/admin/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const assets = [
  { id: "A-001", name: "Forklift FL-22", warehouse: "Warehouse A", status: "Active", health: 72, risk: 0.91 },
  { id: "A-002", name: "Conveyor C-09", warehouse: "Warehouse B", status: "Maintenance", health: 65, risk: 0.86 },
  { id: "A-003", name: "Generator G-11", warehouse: "Warehouse C", status: "Active", health: 81, risk: 0.81 },
];

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Assets</h1>
          <p className="text-sm text-muted-foreground">Manage assets and view predicted risk.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">Export</Button>
          <Button className="rounded-xl">Add Asset</Button>
        </div>
      </div>

      <SectionCard
        title="Asset List"
        right={<div className="w-[240px]"><Input className="h-9 rounded-xl" placeholder="Search assets..." /></div>}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Health</TableHead>
              <TableHead className="text-right">Risk</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-muted-foreground">{a.id}</TableCell>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="text-muted-foreground">{a.warehouse}</TableCell>
                <TableCell>
                  <Badge variant={a.status === "Maintenance" ? "secondary" : "default"}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{a.health}%</TableCell>
                <TableCell className="text-right">
                  <Badge>{a.risk}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" className="h-8 rounded-xl px-3 text-xs">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
