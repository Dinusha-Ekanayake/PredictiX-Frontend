import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WarehouseInsightSummary() {
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Warehouse Insight Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          The warehouse is currently operating at an average health score of{" "}
          <span className="font-semibold text-foreground">77%</span>, indicating generally stable conditions.
        </p>

        <p>
          One asset is identified as high risk and requires maintenance within the next{" "}
          <span className="font-semibold text-foreground">2 days</span>. The overall maintenance workload
          remains moderate, with{" "}
          <span className="font-semibold text-foreground">3 active tickets</span>.
        </p>

        <p>
          The total predicted maintenance cost for the next 30 days is estimated at{" "}
          <span className="font-semibold text-foreground">LKR 45,200</span>.
        </p>

        <p>
          Operational efficiency is stable with minimal downtime, though tire related issues represent the
          most significant maintenance concern.
        </p>

        <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-foreground">
          Immediate attention is recommended for high priority assets to prevent unexpected failures.
        </div>
      </CardContent>
    </Card>
  )
}