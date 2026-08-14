import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center bg-accent px-1.5 py-[3px] font-mono text-[10px] tracking-[0.06em] uppercase text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
