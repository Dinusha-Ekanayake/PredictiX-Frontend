"use client";

import * as React from "react";

const brakeHealthData = [
  { label: "Excellent", value: 34, color: "bg-green-500" },
  { label: "Good", value: 28, color: "bg-blue-500" },
  { label: "Warning", value: 18, color: "bg-yellow-500" },
  { label: "Critical", value: 10, color: "bg-red-500" },
];

export default function BrakeHealthDistributionCard() {
  const total = brakeHealthData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Brake Health Distribution
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Distribution of brake condition across vehicles
        </p>
      </div>

      <div className="space-y-4">
        {brakeHealthData.map((item) => {
          const percent = Math.round((item.value / total) * 100);

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-gray-700 dark:text-slate-300">
                    {item.label}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {percent}%
                </span>
              </div>

              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-slate-700">
                <div
                  className={`h-3 rounded-full ${item.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}