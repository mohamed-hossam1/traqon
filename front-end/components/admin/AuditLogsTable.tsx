"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  ShieldAlert,
  UserX,
  UserCheck,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Eye,
  Info,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { listAuditLogs } from "@/actions/admin";
import { adminAuditLogsQueryKey } from "@/lib/reactQuery/query-keys";
import { TableSkeleton } from "./TableSkeleton";
import { TablePagination } from "./TablePagination";
import { ROUTES } from "@/constants/routes";
import type { AdminAuditLog } from "@/types/admin";
import { unwrapAction } from "@/lib/next-action-handler/unwrap";
import { Button } from "@/components/ui/button";

const ACTION_OPTIONS = [
  { label: "All Actions", value: "" },
  { label: "Ban User", value: "ban_user" },
  { label: "Unban User", value: "unban_user" },
  { label: "Change Role", value: "change_role" },
  { label: "Revoke Session", value: "revoke_session" },
];

function ActionBadge({ action }: { action: string }) {
  switch (action) {
    case "ban_user":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
          <UserX className="size-3.5" />
          Ban User
        </span>
      );
    case "unban_user":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <UserCheck className="size-3.5" />
          Unban User
        </span>
      );
    case "change_role":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="size-3.5" />
          Change Role
        </span>
      );
    case "revoke_session":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <KeyRound className="size-3.5" />
          Revoke Session
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-muted text-muted-foreground border border-border">
          <Info className="size-3.5" />
          {action}
        </span>
      );
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function parseDetails(details: string | null) {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch {
    return details;
  }
}

export function AuditLogsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const getParam = (key: string, fallback: number) => {
    const val = searchParams?.get(key);
    if (!val) return fallback;
    const n = parseInt(val, 10);
    return Number.isNaN(n) ? fallback : n;
  };

  const page = getParam("page", 1);
  const limit = getParam("limit", 15);
  const action = searchParams?.get("action") ?? "";
  const adminId = searchParams?.get("adminId") ?? "";
  const targetUserId = searchParams?.get("targetUserId") ?? "";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...adminAuditLogsQueryKey, page, limit, action, adminId, targetUserId],
    queryFn: () =>
      unwrapAction(
        listAuditLogs({
          page,
          limit,
          action: action || undefined,
          adminId: adminId || undefined,
          targetUserId: targetUserId || undefined,
        })
      ),
  });

  const setParam = useCallback(
    (key: string, value?: string | number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("page", "1");
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      router.replace(`${ROUTES.ADMIN_AUDIT_LOGS}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(ROUTES.ADMIN_AUDIT_LOGS, { scroll: false });
  }, [router]);

  const logs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-foreground/10 bg-card/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Action:
            </span>
            <select
              value={action}
              onChange={(e) => setParam("action", e.target.value)}
              className="h-9 border border-foreground/20 bg-background px-3 py-1 text-xs font-mono focus:border-accent focus:outline-none"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Admin ID Filter */}
          <input
            type="text"
            placeholder="Filter by Admin ID..."
            value={adminId}
            onChange={(e) => setParam("adminId", e.target.value)}
            className="h-9 w-48 border border-foreground/20 bg-background px-3 text-xs font-mono focus:border-accent focus:outline-none placeholder:text-muted-foreground/50"
          />

          {/* Target User ID Filter */}
          <input
            type="text"
            placeholder="Filter by Target ID..."
            value={targetUserId}
            onChange={(e) => setParam("targetUserId", e.target.value)}
            className="h-9 w-48 border border-foreground/20 bg-background px-3 text-xs font-mono focus:border-accent focus:outline-none placeholder:text-muted-foreground/50"
          />

          {(action || adminId || targetUserId) && (
            <Button
              variant="auth-outline"
              size="auth-sm"
              onClick={resetFilters}
              className="h-9 text-xs"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              Reset Filters
            </Button>
          )}
        </div>

        {meta && (
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Total Logs: <span className="text-foreground font-semibold">{meta.totalItems}</span>
          </div>
        )}
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : error ? (
        <div className="p-8 text-center border border-destructive/20 bg-destructive/5">
          <p className="text-sm text-destructive mb-3 font-mono">
            Failed to load audit logs. Please try again.
          </p>
          <Button variant="auth-outline" size="auth-sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center border border-foreground/10 bg-card/30">
          <ShieldAlert className="size-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No audit logs found matching your filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-foreground/10 bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-foreground/10 bg-muted/40 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Admin</th>
                <th className="px-4 py-3.5">Target User</th>
                <th className="px-4 py-3.5">Details</th>
                <th className="px-4 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 font-mono text-xs">
              {logs.map((log) => {
                const parsed = parseDetails(log.details);
                return (
                  <tr key={log.id} className="hover:bg-foreground/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground/60" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <ActionBadge action={log.action} />
                    </td>

                    {/* Admin */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {log.adminName ?? "Admin"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                          {log.adminEmail ?? log.adminId}
                        </span>
                      </div>
                    </td>

                    {/* Target User */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {log.targetUserName ?? "User"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                          {log.targetUserEmail ?? log.targetUserId}
                        </span>
                      </div>
                    </td>

                    {/* Details Preview */}
                    <td className="px-4 py-3.5 text-muted-foreground max-w-xs truncate">
                      {typeof parsed === "object" && parsed !== null ? (
                        <span className="text-[11px] bg-muted/60 px-2 py-0.5 border border-border">
                          {JSON.stringify(parsed)}
                        </span>
                      ) : (
                        log.details ?? "—"
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Button
                        variant="auth-outline"
                        size="auth-sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 px-2.5 text-[11px]"
                      >
                        <Eye className="size-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={(p) => setParam("page", p)}
        />
      )}

      {/* Detailed Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg border border-foreground/20 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-accent" />
                <h3 className="font-mono text-sm uppercase tracking-widest font-bold">
                  Audit Log Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-foreground/5">
                <span className="text-muted-foreground uppercase text-[10px]">Action</span>
                <ActionBadge action={selectedLog.action} />
              </div>

              <div className="py-1 border-b border-foreground/5 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">Log ID</span>
                <span className="text-foreground text-[11px] break-all">{selectedLog.id}</span>
              </div>

              <div className="py-1 border-b border-foreground/5 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">Timestamp</span>
                <span className="text-foreground">{formatDate(selectedLog.createdAt)}</span>
              </div>

              <div className="py-1 border-b border-foreground/5 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">Performed By (Admin)</span>
                <div className="text-foreground font-sans text-xs">
                  <p className="font-semibold">{selectedLog.adminName ?? "Admin"}</p>
                  <p className="text-muted-foreground text-[11px]">{selectedLog.adminEmail}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/70">{selectedLog.adminId}</p>
                </div>
              </div>

              <div className="py-1 border-b border-foreground/5 space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">Target User</span>
                <div className="text-foreground font-sans text-xs">
                  <p className="font-semibold">{selectedLog.targetUserName ?? "User"}</p>
                  <p className="text-muted-foreground text-[11px]">{selectedLog.targetUserEmail}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/70">{selectedLog.targetUserId}</p>
                </div>
              </div>

              {selectedLog.adminSessionId && (
                <div className="py-1 border-b border-foreground/5 space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px] block">Admin Session ID</span>
                  <span className="text-muted-foreground text-[11px] break-all">
                    {selectedLog.adminSessionId}
                  </span>
                </div>
              )}

              <div className="space-y-1 pt-2">
                <span className="text-muted-foreground uppercase text-[10px] block">Raw Details (JSON)</span>
                <pre className="p-3 bg-muted/40 border border-foreground/10 text-[11px] font-mono overflow-x-auto text-foreground">
                  {selectedLog.details
                    ? JSON.stringify(parseDetails(selectedLog.details), null, 2)
                    : "No extra details provided."}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="auth-outline"
                size="auth-sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
