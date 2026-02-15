"use client";

import * as React from "react";
import { Search, Filter, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NewTicketDialog from "@/components/admin/NewTicketDialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AdminTicketsPage() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-muted-foreground">Manage support tickets and alerts.</p>
      </div>

      {/* Search + filters bar */}
      <div className="w-full">
        <div className="flex w-full items-center gap-3 rounded-2xl border border-input bg-transparent p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-12 h-12 rounded-lg" />
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span>Open</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-amber-400" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Resolved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Closed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button onClick={() => setOpen(true)} className="bg-cyan-500 hover:bg-cyan-400 text-white">+ New Ticket</Button>
              </div>
        </div>
      </div>

      {/* Empty state panel */}
      <Card className="rounded-2xl">
        <CardContent>
          <div className="flex h-60 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-input">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No tickets found matching your filters</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <NewTicketDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

