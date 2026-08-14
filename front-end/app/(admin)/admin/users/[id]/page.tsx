"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/actions/admin";
import { adminUserDetailQueryKey } from "@/lib/reactQuery/query-keys";
import { UserDetailsCard } from "@/components/admin/UserDetailsCard";
import { UserSessionsTable } from "@/components/admin/UserSessionsTable";
import { BanHistoryTable } from "@/components/admin/BanHistoryTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState<"sessions" | "banHistory">("sessions");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: adminUserDetailQueryKey(userId),
    queryFn: async () => {
      const result = await getUserById({ id: userId });
      if (result?.serverError) throw new Error(result.serverError.message);
      return result?.data;
    },
  });

  const banHistoryCount = data?.user?.banHistory?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_USERS}>
          <Button variant="auth-outline" size="auth-sm">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="font-serif-display italic text-2xl">User Details</h1>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-none bg-foreground/10" />
        </div>
      )}

      {error && (
        <div className="border border-destructive bg-destructive/5 rounded-none p-6">
          <p className="font-serif-body italic text-destructive text-sm">
            {error instanceof Error ? error.message : "Failed to load user"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 font-mono text-[11px] uppercase tracking-widest text-accent underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && data?.user && (
        <>
          <UserDetailsCard user={data.user} />

          <div className="space-y-4 pt-4">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("sessions")}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeTab === "sessions"
                    ? "border-b-2 border-accent text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveTab("banHistory")}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ${
                  activeTab === "banHistory"
                    ? "border-b-2 border-accent text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ban History
                {banHistoryCount > 0 && (
                  <span className="px-1.5 py-0.5 font-mono text-[10px] bg-muted/20 text-muted-foreground">
                    {banHistoryCount}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "sessions" && (
              <UserSessionsTable userId={userId} />
            )}

            {activeTab === "banHistory" && (
              <BanHistoryTable banHistory={data.user.banHistory ?? []} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
