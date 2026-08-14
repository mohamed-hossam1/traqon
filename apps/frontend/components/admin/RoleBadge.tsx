"use client";

export function RoleBadge({ role }: { role: "user" | "admin" }) {
  return (
    <span className="inline-flex items-center px-2 py-1 bg-foreground/5 font-mono text-[10px] uppercase tracking-[0.06em] text-foreground">
      {role}
    </span>
  );
}
