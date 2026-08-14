"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUserSessions, adminRevokeSession } from "@/actions/admin";
import { adminUserSessionsQueryKey } from "@/lib/reactQuery/query-keys";
import { TableSkeleton } from "./TableSkeleton";
import { TablePagination } from "./TablePagination";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { AdminSession } from "@/types/admin";
import { getBrowserInfo } from "@/lib/visitorInfo/browserInfo";
import { DeviceIcon } from "@/lib/visitorInfo/DeviceIcon";
import { unwrapAction } from "@/lib/next-action-handler/unwrap";
import { useState } from "react";

import { useSession } from "@/hooks/session";

export function UserSessionsTable({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: currentAuth } = useSession();
  const currentSessionId = currentAuth?.session?.id;
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...adminUserSessionsQueryKey(userId), page, limit],
    queryFn: () => unwrapAction(listUserSessions({ id: userId, page, limit })),
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) =>
      unwrapAction(adminRevokeSession({ userId, sessionId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserSessionsQueryKey(userId) });
      toast.success("Session revoked");
      setConfirmRevoke(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to revoke session"),
  });

  const sessions = data?.sessions ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {isLoading && <TableSkeleton rows={5} columns={7} />}
      {error && (
        <div className="border border-destructive bg-destructive/5 rounded-none p-6">
          <p className="font-serif-body italic text-destructive text-sm">
            {error instanceof Error ? error.message : "Failed to load sessions"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 font-mono text-[11px] uppercase tracking-widest text-accent underline"
          >
            Retry
          </button>
        </div>
      )}
      {!isLoading && !error && sessions.length === 0 && (
        <div className="border border-border bg-card rounded-none p-8">
          <p className="font-serif-body italic text-muted-foreground text-center">No sessions found</p>
        </div>
      )}
      {!isLoading && !error && sessions.length > 0 && (
        <>
          <div className="border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Device</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Browser</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">OS</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">IP</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Login Time</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Last Activity</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sessionItem: AdminSession) => {
                  const isActive = sessionItem.status === "active";
                  const isCurrent = sessionItem.sessionId === currentSessionId;
                  const info = getBrowserInfo(sessionItem.userAgent);
                  return (
                    <tr key={sessionItem.sessionId} className="border-b border-border hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <DeviceIcon device={info.device} className="size-4 text-muted-foreground" />
                          <span className="font-mono text-[11px] text-foreground capitalize">{info.device}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-foreground">
                        {info.browser}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-foreground">
                        {info.os}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {sessionItem.ipAddress ?? "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <SessionStatusBadge status={sessionItem.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {new Date(sessionItem.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {new Date(sessionItem.lastUsedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {isActive && !isCurrent && (
                          <Button variant="auth-outline" size="auth-sm" onClick={() => setConfirmRevoke(sessionItem.sessionId)}>
                            Revoke
                          </Button>
                        )}
                        {isCurrent && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            Current Session
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <AlertDialog open={!!confirmRevoke} onOpenChange={(open) => !open && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Revoke Session</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke this session? The user will be logged out on that device.
          </AlertDialogDescription>
          <div className="flex gap-3 mt-4">
            <AlertDialogCancel asChild>
              <Button variant="auth-outline" size="auth-sm">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="auth"
                size="auth-sm"
                disabled={revokeMutation.isPending}
                onClick={() => confirmRevoke && revokeMutation.mutate(confirmRevoke)}
              >
                {revokeMutation.isPending ? "Revoking..." : "Revoke"}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SessionStatusBadge({ status }: { status: AdminSession["status"] }) {
  const color =
    status === "active"
      ? "bg-good/10 text-good"
      : status === "revoked"
        ? "bg-bad/10 text-bad"
        : "bg-muted/10 text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] ${color}`}>
      {status}
    </span>
  );
}

