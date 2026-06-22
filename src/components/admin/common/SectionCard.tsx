import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SectionCard({
  title,
  right,
  children,
  noPadding,
  className,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card/90 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent className={cn(noPadding && "p-0")}>{children}</CardContent>
    </Card>
  );
}
