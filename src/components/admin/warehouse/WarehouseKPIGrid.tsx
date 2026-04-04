"use client";

import * as React from "react";

export default function WarehouseKPIGrid({ data: externalData }: { data?: any[] }) {
  // Use only external data from PostgreSQL - no fallback defaults
  const data = externalData && externalData.length > 0 ? externalData : [];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {item.title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {item.value}
          </h3>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            {item.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}