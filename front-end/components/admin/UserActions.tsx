"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { banUser, unbanUser, changeUserRole } from "@/actions/admin";
import { adminUsersQueryKey } from "@/lib/reactQuery/query-keys";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import type { AdminPublicUser } from "@/types/admin";

import { unwrapAction } from "@/lib/next-action-handler/unwrap";

import { useSession } from "@/hooks/session";

export function UserActions({ user }: { user: AdminPublicUser }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [banReason, setBanReason] = useState("");

  const isSelf = session?.user?.id === user.id;
  const targetRole = user.role === "admin" ? "user" : "admin";

  const closeMenuAnd = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  const banMutation = useMutation({
    mutationFn: (reason: string) =>
      unwrapAction(banUser({ id: user.id, banReason: reason })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      toast.success("User banned");
      setShowBanDialog(false);
      setBanReason("");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: () => unwrapAction(unbanUser({ id: user.id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      toast.success("User unbanned");
      setShowUnbanDialog(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to unban user"),
  });

  const roleMutation = useMutation({
    mutationFn: () =>
      unwrapAction(changeUserRole({ id: user.id, role: targetRole })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      toast.success(`Role changed to ${targetRole}`);
      setShowRoleDialog(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to change role"),
  });

  const banned = user.isBanned;

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="auth-outline"
            size="auth-sm"
            aria-label="User actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-none border-border bg-card">
          <DropdownMenuItem asChild>
            <Link
              href={`${ROUTES.ADMIN_USERS}/${user.id}`}
              className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
            >
              View Details
            </Link>
          </DropdownMenuItem>
          {!isSelf && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                onClick={closeMenuAnd(() => setShowRoleDialog(true))}
              >
                Change Role to {targetRole}
              </DropdownMenuItem>
              {!banned ? (
                <DropdownMenuItem
                  variant="destructive"
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  onClick={closeMenuAnd(() => setShowBanDialog(true))}
                >
                  Ban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="font-mono text-[11px] uppercase tracking-widest cursor-pointer"
                  onClick={closeMenuAnd(() => setShowUnbanDialog(true))}
                >
                  Unban User
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Change User Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change the role of {user.name ?? user.email} from <strong>{user.role}</strong> to <strong>{targetRole}</strong>?
          </AlertDialogDescription>
          <div className="flex gap-3 mt-4">
            <Button
              variant="auth-outline"
              size="auth-sm"
              onClick={() => setShowRoleDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="auth"
              size="auth-sm"
              disabled={roleMutation.isPending}
              onClick={() => roleMutation.mutate()}
            >
              {roleMutation.isPending ? "Updating..." : `Change to ${targetRole}`}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Ban User</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a reason for banning {user.name ?? user.email}.
          </AlertDialogDescription>
          <input
            type="text"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason..."
            className="w-full mt-2 px-3 py-2 bg-background border border-border font-mono text-[11px] text-foreground focus:outline-none focus:border-accent rounded-none"
          />
          <div className="flex gap-3 mt-4">
            <Button
              variant="auth-outline"
              size="auth-sm"
              onClick={() => setShowBanDialog(false)}
            >
              Cancel
            </Button>
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
            Are you sure you want to unban {user.name ?? user.email}?
          </AlertDialogDescription>
          <div className="flex gap-3 mt-4">
            <Button
              variant="auth-outline"
              size="auth-sm"
              onClick={() => setShowUnbanDialog(false)}
            >
              Cancel
            </Button>
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
    </>
  );
}
