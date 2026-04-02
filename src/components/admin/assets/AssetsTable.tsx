"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Asset } from "./types";
import type { ComponentProps } from "react";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

function StatusBadge({ s }: { s: Asset["status"] }) {
  const variant: BadgeVariant =
    s === "CRITICAL"
      ? "destructive"
      : s === "MAINTENANCE"
        ? "secondary"
        : "default";

  return <Badge variant={variant}>{s}</Badge>;
}

type AssetsTableProps = {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function AssetsTable({
  assets,
  selectedId,
  onSelect,
}: AssetsTableProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Asset List</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-12 rounded-xl border bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-5">Asset</div>
          <div className="col-span-3">Warehouse</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Health</div>
        </div>

        <ScrollArea className="mt-3 h-130 rounded-xl border">
          <div className="divide-y">
            {assets.map((a) => {
              const active = selectedId === a.id;

              return (
                <button
                  key={a.id}
                  onClick={() => onSelect(a.id)}
                  className={[
                    "w-full px-3 py-3 text-left transition",
                    "hover:bg-accent/40",
                    active ? "bg-accent/50" : "",
                  ].join(" ")}
                >
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-5">
                      <div className="text-sm font-semibold leading-tight">
                        {a.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{a.id}</div>
                    </div>

                    <div className="col-span-3">
                      <div className="text-sm font-medium">{a.warehouse.name}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {a.location}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <StatusBadge s={a.status} />
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="text-sm font-semibold">{a.healthScore}%</div>
                      <div className="text-xs text-muted-foreground">
                        Risk {(a.failureProbability8w * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}