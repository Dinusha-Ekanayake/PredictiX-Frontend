"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TicketItem = {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
};

const latestTickets: TicketItem[] = [
  { id: "TCK-2301", title: "Abnormal vibration on Compressor A-14", category: "Mechanical", priority: "High", status: "Open", createdAt: "2026-01-05" },
  { id: "TCK-2297", title: "Oil leak suspected near Pump P-09", category: "Maintenance", priority: "Medium", status: "In Progress", createdAt: "2026-01-04" },
  { id: "TCK-2293", title: "Sensor drift on Motor M-02", category: "Sensors", priority: "Low", status: "Resolved", createdAt: "2026-01-03" },
];

function PriorityBadge({ priority }: { priority: TicketItem["priority"] }) {
  if (priority === "High") return <Badge variant="destructive">High</Badge>;
  if (priority === "Medium") return <Badge variant="secondary">Medium</Badge>;
  return <Badge variant="outline">Low</Badge>;
}

function StatusBadge({ status }: { status: TicketItem["status"] }) {
  if (status === "Open") return <Badge variant="destructive">Open</Badge>;
  if (status === "In Progress") return <Badge variant="secondary">In Progress</Badge>;
  return <Badge variant="outline">Resolved</Badge>;
}

export default function LatestTickets() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Latest Tickets</CardTitle>
          <p className="text-sm text-muted-foreground">Monitor current issues and progress.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Manage Tickets</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Ticket ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead className="w-[120px]">Priority</TableHead>
                <TableHead className="w-35">Status</TableHead>
                <TableHead className="w-[130px]">Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {latestTickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.id}</TableCell>
                  <TableCell className="min-w-[320px]">{t.title}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
