import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProfileFieldLabel({
  className,
  icon,
  children,
  ...props
}: ComponentProps<"label"> & { icon?: ReactNode }) {
  return (
    <label
      className={cn(
        "flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </label>
  );
}
