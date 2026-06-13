"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceItem {
  asset: string;
  predicted: number;
  scheduled: number;
}

export default function MaintenanceScheduleTable() {
  const [data, setData] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiBaseUrl}/warehouse-dashboard/maintenance-schedule`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span>📋 Predictive Maintenance Schedule</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Predicted need vs scheduled window (days)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin">⏳</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No maintenance schedule data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Asset</th>
                  <th className="text-center px-4 py-3 font-semibold">
                    <span className="text-red-500">Predicted (weeks)</span>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    <span className="text-green-500">Scheduled (weeks)</span>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const gap = item.predicted - item.scheduled;
                  const isUrgent = gap < 0;
                  const isCritical = gap < -0.5;

                  return (
                    <tr
                      key={idx}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">{item.asset}</td>
                      <td className="text-center px-4 py-4">
                        <span className="text-red-600 font-semibold">
                          {item.predicted.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-green-600 font-semibold">
                          {item.scheduled.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4">
                        {isCritical ? (
                          <div className="flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                              Critical
                            </span>
                          </div>
                        ) : isUrgent ? (
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold text-orange-500">
                              Urgent
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Healthy</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
