"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type AlertItem = {
  id: string;
  severity: "Critical" | "Warning" | "Info";
  asset: string;
  message: string;
  time: string;
};

const recentAlerts: AlertItem[] = [
  { id: "AL-1007", severity: "Critical", asset: "Compressor A-14", message: "Vibration exceeded threshold.", time: "10 mins ago" },
  { id: "AL-1006", severity: "Warning", asset: "Pump P-09", message: "Temperature rising trend detected.", time: "34 mins ago" },
  { id: "AL-1005", severity: "Info", asset: "Motor M-02", message: "Maintenance window scheduled for tomorrow.", time: "2 hrs ago" },
];

function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
  if (severity === "Critical") return <Badge variant="destructive">Critical</Badge>;
  if (severity === "Warning") return <Badge variant="secondary">Warning</Badge>;
  return <Badge variant="outline">Info</Badge>;
}

export default function RecentAlerts() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Alerts
          <Button variant="ghost" size="sm" className="gap-1">
            View all <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest detected events from monitoring.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {recentAlerts.map((a) => (
          <div key={a.id} className="rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <SeverityBadge severity={a.severity} />
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium">{a.asset}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
