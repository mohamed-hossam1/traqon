import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
  variant?: "spinner" | "bar" | "square";
  fullscreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

const labelSizeClasses = {
  sm: "text-[9px] tracking-[0.12em]",
  md: "text-[11px] tracking-[0.18em]",
  lg: "text-[13px] tracking-[0.24em]",
};

export function Loader({
  className,
  size = "md",
  label = "LOADING",
  variant = "spinner",
  fullscreen = false,
  ...props
}: LoaderProps) {
  const loaderElement = (
    <div className="flex flex-col items-center justify-center gap-3">
      {variant === "spinner" && (
        <div
          className={cn(
            "animate-spin rounded-none border-foreground/25 border-t-accent",
            sizeClasses[size]
          )}
          style={{ transformOrigin: "center" }}
        />
      )}
      {variant === "square" && (
        <div
          className={cn(
            "animate-bounce rounded-none bg-accent",
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-6 w-6" : "h-9 w-9"
          )}
        />
      )}
      {variant === "bar" && (
        <div
          className={cn(
            "relative overflow-hidden border border-foreground bg-foreground/5 rounded-none",
            size === "sm" ? "h-1.5 w-24" : size === "md" ? "h-3 w-40" : "h-4 w-56"
          )}
        >
          <div
            className="absolute inset-y-0 left-0 bg-accent w-1/3"
            style={{ animation: "loading-bar-shimmer 0.8s infinite linear" }}
          />
        </div>
      )}
      {label && (
        <span
          className={cn(
            "font-mono uppercase font-semibold text-muted-foreground/80 animate-pulse",
            labelSizeClasses[size]
          )}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground p-6",
          className
        )}
        {...props}
      >
        {loaderElement}
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center p-4", className)}
      {...props}
    >
      {loaderElement}
    </div>
  );
}
