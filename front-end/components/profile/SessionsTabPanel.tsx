"use client";

import { AlertCircle, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { listSessionsPublic, revokeSessionById } from "@/actions/profile";
import SessionCard from "@/components/profile/SessionCard";
import { SectionHeader } from "@/components/profile/section-header";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/utils";
import type { PublicSession } from "@/types/auth";
import { accountSessionsQueryKey } from "@/lib/reactQuery/query-keys";

export function SessionsTabPanel({
  isOpen,
  isActive,
}: {
  isOpen: boolean;
  isActive: boolean;
}) {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: accountSessionsQueryKey,
    enabled: isOpen && isActive,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<PublicSession[]> => {
      const result = await listSessionsPublic();
      if (result?.serverError) {
        throw new Error(
          result.serverError?.message || "Failed to load active sessions.",
        );
      }
      return result?.data ?? [];
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const result = await revokeSessionById({ sessionId });
      if (result?.serverError) {
        throw new Error(
          result.serverError?.message || "Failed to revoke the session.",
        );
      }
      return { sessionId };
    },
    onSuccess: ({ sessionId }) => {
      queryClient.setQueryData<PublicSession[] | undefined>(
        accountSessionsQueryKey,
        (currentSessions) =>
          currentSessions?.filter((session) => session.id !== sessionId),
      );
      toast.success("Session revoked.", { position: "top-center" });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { position: "top-center" });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: accountSessionsQueryKey });
    },
  });

  const sessions = sessionsQuery.data ?? [];
  const currentSession = sessions.find((session) => session.isCurrent);
  const otherSessions = sessions.filter((session) => !session.isCurrent);
  const revokingSessionId = revokeSessionMutation.isPending
    ? revokeSessionMutation.variables.sessionId
    : null;

  return (
    <TabsContent value="sessions" className="m-0 outline-none">
      <div className="flex flex-col gap-7 p-6">
        <SectionHeader
          title="Active Sessions"
          description="Manage devices where you are currently signed in."
        />

        {sessionsQuery.isPending && sessionsQuery.data === undefined && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-none bg-foreground/10"
              />
            ))}
          </div>
        )}

        {sessionsQuery.isError && (
          <div className="flex flex-col gap-3 border border-destructive bg-destructive/5 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                  Failed to load sessions
                </p>
                <p className="mt-1 font-serif-body italic text-sm text-subtitle">
                  {getErrorMessage(sessionsQuery.error)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="auth-outline"
              size="auth-sm"
              className="text-[11px]"
              onClick={() => void sessionsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {!sessionsQuery.isPending &&
          !sessionsQuery.isError &&
          currentSession && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                This Device
              </p>
              <SessionCard session={currentSession} isCurrent />
            </div>
          )}

        {!sessionsQuery.isPending && !sessionsQuery.isError && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Other Sessions
            </p>

            {otherSessions.length === 0 ? (
              <div className="flex items-center gap-3 border border-border bg-card p-3">
                <ShieldCheck
                  className="size-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="font-serif-body italic text-sm text-subtitle">
                  No other active sessions found.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {otherSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isRevoking={revokingSessionId === session.id}
                    onRevoke={() =>
                      revokeSessionMutation.mutate({ sessionId: session.id })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
