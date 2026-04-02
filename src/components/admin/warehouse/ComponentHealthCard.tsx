"use client";

import * as React from "react";

const componentHealthData = [
  { name: "Brakes", health: 72 },
  { name: "Engine", health: 88 },
  { name: "Transmission", health: 81 },
  { name: "Hydraulics", health: 67 },
  { name: "Electrical", health: 76 },
];

export default function ComponentHealthCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Component Health
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Health score by major vehicle component
        </p>
      </div>

      <div className="space-y-4">
        {componentHealthData.map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-slate-300">
                {item.name}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.health}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-slate-700">
              <div
                className="h-3 rounded-full bg-blue-500"
                style={{ width: `${item.health}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}