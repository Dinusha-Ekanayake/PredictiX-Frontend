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
    <Card className="card-dynamic rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-muted-foreground">
              {label}
            </div>
            <div className="mt-1.5 text-2xl font-semibold tracking-tight">
              {value}
            </div>
            {hint ? (
              <div className="mt-1 text-[12px] text-muted-foreground/70">
                {hint}
              </div>
            ) : null}
          </div>

          {icon ? (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl p-2.5 transition-colors",
                accentColor
                  ? accentColor
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
