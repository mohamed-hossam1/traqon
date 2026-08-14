"use client";

export function StatusBadge({ status }: { status: "active" | "banned" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] ${
        status === "active"
          ? "bg-good/10 text-good"
          : "bg-bad/10 text-bad"
      }`}
    >
      {status}
    </span>
  );
}
