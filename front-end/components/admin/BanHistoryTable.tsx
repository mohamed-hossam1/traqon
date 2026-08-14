"use client";

import type { BanRecord } from "@/types/admin";

export function BanHistoryTable({
  banHistory,
}: {
  banHistory: BanRecord[];
}) {
  if (!banHistory || banHistory.length === 0) {
    return (
      <div className="border border-border bg-card rounded-none p-8">
        <p className="font-serif-body italic text-muted-foreground text-center">
          No ban history records found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Ban Reason
              </th>
              <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Banned At
              </th>
              <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                Unbanned At
              </th>
            </tr>
          </thead>
          <tbody>
            {banHistory.map((record) => {
              const isActiveBan = !record.unbannedAt;
              return (
                <tr
                  key={record.id}
                  className="border-b border-border hover:bg-card/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] ${
                        isActiveBan
                          ? "bg-bad/10 text-bad"
                          : "bg-good/10 text-good"
                      }`}
                    >
                      {isActiveBan ? "Active Ban" : "Unbanned"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {record.banReason}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {new Date(record.bannedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {record.unbannedAt
                      ? new Date(record.unbannedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
