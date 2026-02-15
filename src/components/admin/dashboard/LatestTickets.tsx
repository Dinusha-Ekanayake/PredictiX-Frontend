"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type AlertItem = {
  id: string;
  severity: "Critical" | "Warning" | "Info";
  title: string;
  description: string;
  timeAgo: string;
};

const alerts: AlertItem[] = [
  {
    id: "A-1001",
    severity: "Critical",
    title: "Compressor A-14",
    description: "Vibration exceeded threshold (RMS 12.3 mm/s).",
    timeAgo: "10 mins ago",
  },
  {
    id: "A-1002",
    severity: "Warning",
    title: "Pump P-09",
    description: "Temperature rising trend detected (last 3 hours).",
    timeAgo: "34 mins ago",
  },
  {
    id: "A-1003",
    severity: "Info",
    title: "Motor M-02",
    description: "Maintenance window scheduled for tomorrow.",
    timeAgo: "2 hrs ago",
  },
];

function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
  if (severity === "Critical") return <Badge variant="destructive">Critical</Badge>;
  if (severity === "Warning") return <Badge variant="secondary">Warning</Badge>;
  return <Badge variant="outline">Info</Badge>;
}

export default function LatestTickets() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Recent Alerts</CardTitle>
          <p className="text-sm text-muted-foreground">Latest detected events from asset monitoring.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            View all
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-4 rounded-lg border p-4 bg-card">
              <div className="shrink-0">
                <SeverityBadge severity={a.severity} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </div>

                  <div className="text-xs text-muted-foreground whitespace-nowrap">{a.timeAgo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
