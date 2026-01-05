"use client";

import { useRouter } from "next/navigation";

type NavStartFn = () => void;

declare global {
  interface Window {
    __predictixNavStart?: NavStartFn;
  }
}

export function useNavRouter() {
  const router = useRouter();

  function navStart() {
    window.__predictixNavStart?.();
  }

  return {
    ...router,
    push: (href: string) => {
      navStart();
      router.push(href);
    },
    replace: (href: string) => {
      navStart();
      router.replace(href);
    },
    refresh: () => {
      navStart();
      router.refresh();
    },
  };
}
