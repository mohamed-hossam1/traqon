"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { listUserAccounts, unLinkAccount, linkGoogleAccount } from "@/actions/auth";
import { SectionHeader } from "@/components/profile/section-header";
import { Badge } from "@/components/profile/badge";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { accountConnectionsQueryKey } from "@/lib/reactQuery/query-keys";
import { cn, getErrorMessage } from "@/lib/utils";
import type { PublicUser } from "@/types/auth";

export function LinksTabPanel({
  user,
  isOpen,
  isActive,
}: {
  user: PublicUser;
  isOpen: boolean;
  isActive: boolean;
}) {
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: accountConnectionsQueryKey,
    enabled: isOpen && isActive,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const result = await listUserAccounts();
      if (result?.serverError) {
        throw new Error(result.serverError.message || "Failed to load linked accounts.");
      }
      return result?.data ?? [];
    },
  });

  const linkMutation = useMutation({
    mutationFn: async () => {
      const result = await linkGoogleAccount();
      if (result?.serverError || !result?.data?.url) {
        throw new Error(
          result?.serverError?.message || "Failed to initiate Google account link.",
        );
      }
      window.location.assign(result.data.url);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { position: "top-center" });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async ({ providerId }: { providerId: string }) => {
      const result = await unLinkAccount({ providerId });
      if (result?.serverError) {
        throw new Error(result.serverError.message || "Failed to disconnect account.");
      }
      return result?.data;
    },
    onSuccess: () => {
      toast.success("Account disconnected successfully.", { position: "top-center" });
      void queryClient.invalidateQueries({ queryKey: accountConnectionsQueryKey });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { position: "top-center" });
    },
  });

  const accounts = connectionsQuery.data ?? [];
  const googleAccount = accounts.find((acc) => acc.providerId === "google" || acc.provider === "google");
  const isGoogleConnected = !!googleAccount;

  const isGoogleLoading =
    linkMutation.isPending ||
    (unlinkMutation.isPending && unlinkMutation.variables?.providerId === "google");

  const handleGoogleToggle = () => {
    if (isGoogleConnected) {
      unlinkMutation.mutate({ providerId: "google" });
    } else {
      linkMutation.mutate();
    }
  };

  const isAnyMutationPending = linkMutation.isPending || unlinkMutation.isPending;

  return (
    <TabsContent value="links" className="m-0 outline-none">
      <div className="flex flex-col gap-7 p-6">
        <SectionHeader
          title="Linked Accounts"
          description="Manage external authentication services linked to your profile."
        />

        {connectionsQuery.isPending && connectionsQuery.data === undefined && (
          <div className="flex flex-col gap-2">
            {[1].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-none bg-foreground/10"
              />
            ))}
          </div>
        )}

        {connectionsQuery.isError && (
          <div className="flex flex-col gap-3 border border-destructive bg-destructive/5 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                  Failed to load links
                </p>
                <p className="mt-1 font-serif-body italic text-sm text-subtitle">
                  {getErrorMessage(connectionsQuery.error)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="auth-outline"
              size="auth-sm"
              className="text-[11px]"
              onClick={() => void connectionsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {!connectionsQuery.isPending && !connectionsQuery.isError && (
          <div className="flex flex-col gap-3">
            <div
              className={cn(
                "flex items-center gap-3 rounded-none border bg-card px-3 py-3 transition-colors",
                isGoogleConnected
                  ? "border-foreground border-l-4 border-l-accent"
                  : "border-border"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-none border",
                  isGoogleConnected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground/70"
                )}
                aria-hidden="true"
              >
                <svg aria-hidden="true" className="size-4.5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.7 1.22 9.2 3.2l6.88-6.88C35.9 2.1 30.3 0 24 0 14.6 0 6.56 5.4 2.64 13.3l7.98 6.2C12.5 12.7 17.8 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.6-.14-2.8-.44-4.1H24v7.7h12.7c-.26 2.1-1.66 5.3-4.76 7.4l7.3 5.7c4.3-4 6.86-9.9 6.86-16.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.62 28.6c-.52-1.56-.82-3.22-.82-4.9s.3-3.34.8-4.9l-7.98-6.2C.92 15.9 0 19.8 0 23.7c0 3.9.92 7.8 2.62 11.1l8-6.2z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.3 0 11.6-2.1 15.46-5.7l-7.3-5.7c-2 1.4-4.66 2.3-8.16 2.3-6.2 0-11.5-3.2-13.38-8.8l-8 6.2C6.56 42.6 14.6 48 24 48z"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-serif-body text-sm text-foreground">
                    Google Account
                  </p>
                  {isGoogleConnected && <Badge>Connected</Badge>}
                </div>
                <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {isGoogleConnected
                    ? `Active · ${user.email}`
                    : "Not connected"}
                </p>
                {isGoogleConnected && accounts.length === 1 && !user.hasPassword && (
                  <p className="mt-1 text-[11px] text-destructive italic font-serif-body">
                    Cannot disconnect your only sign-in method.
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant={isGoogleConnected ? "auth-destructive" : "auth-outline"}
                size="auth-sm"
                className="px-3 py-1.5 text-[10px]"
                disabled={isAnyMutationPending || (isGoogleConnected && accounts.length === 1 && !user.hasPassword)}
                title={isGoogleConnected && accounts.length === 1 && !user.hasPassword ? "Cannot disconnect your only sign-in method." : undefined}
                onClick={handleGoogleToggle}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    {isGoogleConnected ? "Disconnecting…" : "Connecting…"}
                  </>
                ) : isGoogleConnected ? (
                  "Disconnect"
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3 border border-border bg-card p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground">
              Security Protocol
            </p>
            <p className="font-serif-body italic text-sm text-subtitle">
              Connecting external accounts allows you to sign in with single sign-on.
              Disconnecting a service will revoke login privileges via that provider immediately.
            </p>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
