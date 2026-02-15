import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
            {hint ? (
              <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
            ) : null}
          </div>
          {icon ? (
            <div className="rounded-xl border p-2 text-muted-foreground">
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
