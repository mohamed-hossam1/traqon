"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { RoleBadge } from "./RoleBadge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { banUser, unbanUser } from "@/actions/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersQueryKey, adminUserDetailQueryKey } from "@/lib/reactQuery/query-keys";
import { toast } from "sonner";
import type { AdminPublicUser } from "@/types/admin";
import { useSession } from "@/hooks/session";
import { unwrapAction } from "@/lib/next-action-handler/unwrap";

export function UserDetailsCard({ user }: { user: AdminPublicUser }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [banReason, setBanReason] = useState("");
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);

  const isSelf = session?.user?.id === user.id;

  const banMutation = useMutation({
    mutationFn: (reason: string) =>
      unwrapAction(banUser({ id: user.id, banReason: reason })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(user.id) });
      toast.success("User banned");
      setShowBanDialog(false);
      setBanReason("");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: () => unwrapAction(unbanUser({ id: user.id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(user.id) });
      toast.success("User unbanned");
      setShowUnbanDialog(false);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to unban user"),
  });

  const banned = user.isBanned;

  return (
    <div
      className={`border border-foreground border-t-4 ${
        banned ? "border-t-bad" : "border-t-accent"
      } bg-card rounded-none shadow-none p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-accent/10 flex items-center justify-center text-accent font-medium text-lg">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-serif-display italic text-xl">{user.name ?? "Unnamed"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          <StatusBadge status={banned ? "banned" : "active"} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Verified</p>
          <p className="text-sm text-foreground">{user.isVerified ? "Yes" : "No"}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Has Password</p>
          <p className="text-sm text-foreground">{user.hasPassword ? "Yes" : "No"}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Created At</p>
          <p className="text-sm text-foreground">{new Date(user.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {user.ban && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-bad">Active Ban Info</p>
          <p className="text-sm text-foreground mt-1">Reason: {user.ban.banReason}</p>
          <p className="text-xs text-muted-foreground">Banned at: {new Date(user.ban.bannedAt).toLocaleString()}</p>
        </div>
      )}

      {!isSelf && (
        <div className="mt-6 flex gap-3">
          {!banned ? (
            <Button variant="auth" size="auth-sm" onClick={() => setShowBanDialog(true)}>
              Ban User
            </Button>
          ) : (
            <Button variant="auth-outline" size="auth-sm" onClick={() => setShowUnbanDialog(true)}>
              Unban User
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Ban User</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a reason for banning this user
          </AlertDialogDescription>
          <input
            type="text"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason..."
            className="w-full mt-2 px-3 py-2 bg-background border border-border font-mono text-[11px] text-foreground focus:outline-none focus:border-accent rounded-none"
          />
          <div className="flex gap-3 mt-4">
            <Button variant="auth-outline" size="auth-sm" onClick={() => setShowBanDialog(false)}>Cancel</Button>
            <Button
              variant="auth"
              size="auth-sm"
              disabled={!banReason.trim() || banMutation.isPending}
              onClick={() => banMutation.mutate(banReason.trim())}
            >
              {banMutation.isPending ? "Banning..." : "Ban User"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Unban User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unban this user?
          </AlertDialogDescription>
          <div className="flex gap-3 mt-4">
            <Button variant="auth-outline" size="auth-sm" onClick={() => setShowUnbanDialog(false)}>Cancel</Button>
            <Button
              variant="auth"
              size="auth-sm"
              disabled={unbanMutation.isPending}
              onClick={() => unbanMutation.mutate()}
            >
              {unbanMutation.isPending ? "Unbanning..." : "Unban User"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

