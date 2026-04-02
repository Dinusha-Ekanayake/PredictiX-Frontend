import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
            {hint ? (
              <div className="mt-1 text-[12px] text-muted-foreground/70">
                {hint}
              </div>
            ) : null}
          </div>


          {icon ? (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-2.5 text-muted-foreground">
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}