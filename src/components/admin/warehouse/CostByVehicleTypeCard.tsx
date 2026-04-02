"use client";

import * as React from "react";

const costData = [
  { type: "Trucks", cost: "$12,000" },
  { type: "Forklifts", cost: "$5,200" },
  { type: "Trailers", cost: "$4,400" },
  { type: "Vans", cost: "$2,900" },
];

export default function CostByVehicleTypeCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cost by Vehicle Type
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Estimated maintenance spending per vehicle category
        </p>
      </div>

      <div className="space-y-3">
        {costData.map((item) => (
          <div
            key={item.type}
            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-slate-800"
          >
            <span className="text-sm text-gray-700 dark:text-slate-300">
              {item.type}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.cost}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}