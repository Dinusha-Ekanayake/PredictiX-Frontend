"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Custom-styled Sonner toaster matching the PredictiX dark card-based design.
 *
 * Each toast type gets a coloured left border accent:
 *   success → emerald   |   error → red
 *   warning → amber     |   info  → indigo
 */
function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-l-4 group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3.5",
          title: "group-[.toast]:text-base group-[.toast]:font-semibold",
          description:
            "group-[.toast]:text-sm group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          closeButton:
            "group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
          success:
            "group-[.toaster]:!border-l-emerald-500",
          error:
            "group-[.toaster]:!border-l-red-500",
          warning:
            "group-[.toaster]:!border-l-amber-500",
          info:
            "group-[.toaster]:!border-l-indigo-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
