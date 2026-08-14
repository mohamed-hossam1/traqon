"use client";

import { deleteAccount, updateProfile } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/profile/badge";
import { ProfileFieldLabel } from "@/components/profile/field-label";
import { SectionHeader } from "@/components/profile/section-header";
import { getErrorMessage, getInitials } from "@/lib/utils";
import { sessionQueryKey } from "@/lib/reactQuery/query-keys";
import type { AuthenticatedContext, PublicUser } from "@/types/auth";
import {
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  Pencil,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DELETE_CONFIRMATION_PHRASE = "DELETE";

export function ProfileTabPanel({ user }: { user: PublicUser }) {
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (nextName: string) => {
      const result = await updateProfile({ name: nextName });

      if (result?.serverError) {
        throw new Error(
          result.serverError!.message || "Failed to update your profile.",
        );
      }

      return nextName;
    },
    onMutate: async (nextName) => {
      await queryClient.cancelQueries({ queryKey: sessionQueryKey });

      const previousSession =
        queryClient.getQueryData<AuthenticatedContext | null>(sessionQueryKey);

      queryClient.setQueryData<AuthenticatedContext | null>(
        sessionQueryKey,
        (current: AuthenticatedContext | null | undefined) => {
          if (!current?.session || !current.user) return current ?? null;
          return { ...current, user: { ...current.user, name: nextName } };
        },
      );

      return { previousSession };
    },
    onError: (error, _nextName, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(sessionQueryKey, context.previousSession);
      }

      toast.error(getErrorMessage(error), {
        position: "top-center",
      });
    },
    onSuccess: (nextName) => {
      setIsEditingName(false);
      setName(nextName);
      toast.success("Name updated successfully.", {
        position: "top-center",
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteAccount();

      if (result?.serverError) {
        throw new Error(
          result.serverError?.message || "Failed to delete your account.",
        );
      }
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), {
        position: "top-center",
      });
    },
  });

  const initials = getInitials(user);

  function handleCancelName() {
    setIsEditingName(false);
    setName(user.name);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Name is required.", { position: "top-center" });
      return;
    }

    if (trimmedName === user.name) {
      setIsEditingName(false);
      setName(user.name);
      return;
    }

    updateProfileMutation.mutate(trimmedName);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setIsDeleteDialogOpen(open);

    if (!open) {
      setDeleteConfirmation("");
    }
  }

  const isDeleteConfirmed =
    deleteConfirmation.trim().toUpperCase() === DELETE_CONFIRMATION_PHRASE;

  return (
    <TabsContent value="profile" className="m-0 outline-none">
      <div className="flex flex-col gap-7 p-6">
        <SectionHeader
          title="Profile"
          description="Manage your personal information."
        />

        <div className="flex flex-col gap-4 border border-foreground border-t-4 border-t-accent bg-card p-4 sm:flex-row sm:items-center">
          <Avatar className="size-16 shrink-0">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-foreground text-background font-mono text-base font-medium tracking-[0.06em] uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif-display text-xl text-title leading-tight">
              {user.name}
            </p>
            <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {user.email}
            </p>
            {user.emailVerified && <Badge className="mt-2">Verified</Badge>}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <ProfileFieldLabel
              htmlFor="profile-email"
              icon={<Mail className="size-3" />}
            >
              Email Address
            </ProfileFieldLabel>
            <div
              id="profile-email"
              className="border border-foreground bg-background px-3 py-2 font-mono text-sm text-foreground break-all"
            >
              {user.email}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <ProfileFieldLabel
              htmlFor="profile-display-name"
              icon={<UserIcon className="size-3" />}
            >
              Display Name
            </ProfileFieldLabel>

            {isEditingName ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
              >
                <Input
                  id="profile-display-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  autoComplete="name"
                  placeholder="Your display name"
                  disabled={updateProfileMutation.isPending}
                  className="h-10 rounded-none border-foreground bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-0"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    aria-label="Save display name"
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-none border border-foreground bg-foreground text-background transition-colors hover:bg-accent hover:border-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelName}
                    disabled={updateProfileMutation.isPending}
                    aria-label="Cancel editing display name"
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-none border border-foreground bg-transparent text-foreground transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-50"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="group flex items-center justify-between gap-2 border border-foreground bg-background px-3 py-2">
                <span className="font-serif-body text-sm text-foreground">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name);
                    setIsEditingName(true);
                  }}
                  aria-label="Edit display name"
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone — Delete Account */}
        <div className="mt-3 flex flex-col gap-4">
          <div
            className="h-px w-full bg-border"
            aria-hidden="true"
          />

          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-destructive">
              Danger Zone
            </h3>
            <p className="mt-1 font-serif-body italic text-sm text-subtitle">
              Permanently delete your account and all associated data.
            </p>
          </div>

          <div className="flex flex-col gap-3 border border-destructive bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                  Delete account
                </p>
                <p className="mt-1 font-serif-body italic text-sm text-subtitle">
                  This action is irreversible. All your data, sessions, and
                  linked accounts will be permanently removed.
                </p>
              </div>
            </div>

            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={handleDeleteDialogOpenChange}
            >
              <Button
                id="delete-account-trigger"
                type="button"
                variant="auth-destructive"
                size="auth-sm"
                className="sm:w-auto sm:self-end"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete Account
              </Button>

              <AlertDialogContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center border border-destructive bg-destructive/10">
                      <AlertTriangle
                        className="size-5 text-destructive"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription className="mt-1">
                        This will permanently delete your account, all sessions,
                        and linked providers. This action cannot be undone.
                      </AlertDialogDescription>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="delete-confirmation"
                      className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      Type{" "}
                      <span className="text-destructive">
                        {DELETE_CONFIRMATION_PHRASE}
                      </span>{" "}
                      to confirm
                    </label>
                    <Input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(event) =>
                        setDeleteConfirmation(event.target.value)
                      }
                      autoComplete="off"
                      placeholder={DELETE_CONFIRMATION_PHRASE}
                      disabled={deleteAccountMutation.isPending}
                      className="h-10 rounded-none border-foreground bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-destructive focus-visible:ring-0"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <AlertDialogCancel asChild>
                      <Button
                        type="button"
                        variant="auth-outline"
                        size="auth-sm"
                        disabled={deleteAccountMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        id="delete-account-confirm"
                        type="button"
                        variant="auth-destructive"
                        size="auth-sm"
                        disabled={
                          !isDeleteConfirmed ||
                          deleteAccountMutation.isPending
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          deleteAccountMutation.mutate();
                        }}
                      >
                        {deleteAccountMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="size-4" aria-hidden="true" />
                            Delete Permanently
                          </>
                        )}
                      </Button>
                    </AlertDialogAction>
                  </div>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

