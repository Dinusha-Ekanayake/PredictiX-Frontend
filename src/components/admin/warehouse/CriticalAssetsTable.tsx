"use client";

import * as React from "react";

const criticalAssets = [
  { id: "VH-1021", vehicle: "Truck A12", component: "Brake System", health: "42%", priority: "High", status: "Critical" },
  { id: "VH-1044", vehicle: "Forklift F07", component: "Hydraulic Pump", health: "51%", priority: "High", status: "Warning" },
  { id: "VH-1098", vehicle: "Trailer T09", component: "Suspension", health: "39%", priority: "High", status: "Critical" },
  { id: "VH-1102", vehicle: "Van V03", component: "Engine Cooling", health: "47%", priority: "Medium", status: "Warning" },
];

function getStatusColor(status: string) {
  if (status === "Critical") {
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
  }
  if (status === "Warning") {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300";
  }
  return "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300";
}

export default function CriticalAssetsTable({ data: externalData }: { data?: any[] }) {
  const data = externalData || criticalAssets;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:!text-white">
          Critical Assets
        </h2>
        <p className="text-sm text-gray-500 dark:!text-slate-400">
          Assets that need urgent maintenance review
        </p>
      </div>

      {/* Force default text color for everything inside table */}
      <div className="overflow-x-auto text-slate-900 dark:!text-slate-100">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:!text-slate-300">
                Asset ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:!text-slate-300">
                Vehicle
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:!text-slate-300">
                Component
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:!text-slate-300">
                Health
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:!text-slate-300">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:!text-slate-300">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-100 last:border-0 dark:border-slate-800"
              >
                <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:!text-white">
                  {asset.id}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 dark:!text-slate-200">
                  {asset.vehicle}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 dark:!text-slate-200">
                  {asset.component}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 dark:!text-slate-200">
                  {asset.health}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 dark:!text-slate-200">
                  {asset.priority}
                </td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}