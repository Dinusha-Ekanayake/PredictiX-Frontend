"use client";

import * as React from "react";

export function useMinDelay(ms: number) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);

  return ready;
}
