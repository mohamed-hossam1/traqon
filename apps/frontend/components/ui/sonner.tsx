"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-good" />
        ),
        info: (
          <InfoIcon className="size-4 text-accent" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-bad" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-bad" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--foreground)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-foreground group-[.toaster]:border-t-4 group-[.toaster]:border-t-accent group-[.toaster]:rounded-none group-[.toaster]:shadow-none",
          title:
            "group-[.toast]:font-mono group-[.toast]:text-[11px] group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:text-foreground group-[.toast]:font-bold",
          description:
            "group-[.toast]:font-serif-body group-[.toast]:italic group-[.toast]:text-sm group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:hover:bg-accent group-[.toast]:hover:text-white group-[.toast]:font-mono group-[.toast]:text-xs group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:font-bold group-[.toast]:py-2 group-[.toast]:px-3 group-[.toast]:rounded-none group-[.toast]:cursor-pointer group-[.toast]:transition-colors group-[.toast]:duration-150 group-[.toast]:border group-[.toast]:border-foreground",
          cancelButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/10 group-[.toast]:font-mono group-[.toast]:text-xs group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:font-bold group-[.toast]:py-2 group-[.toast]:px-3 group-[.toast]:rounded-none group-[.toast]:cursor-pointer group-[.toast]:transition-colors group-[.toast]:duration-150 group-[.toast]:border group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
