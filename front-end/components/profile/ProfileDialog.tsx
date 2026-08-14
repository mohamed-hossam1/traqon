"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "radix-ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LogOut } from "lucide-react";
import type { PublicUser } from "@/types/auth";
import {
  parseProfileDialogTab,
  type ProfileDialogTab,
} from "@/lib/profile-dialog";
import { ProfileTabPanel } from "./ProfileTabPanel";
import { ProfileTabsList } from "./ProfileTabsList";
import { SecurityTabPanel } from "./SecurityTabPanel";
import { SessionsTabPanel } from "./SessionsTabPanel";
import { LinksTabPanel } from "./LinksTabPanel";

export function ProfileDialog({
  user,
  isOpen,
  activeTab,
  onOpenChange,
  onTabChange,
  onSignOut,
  isSigningOut = false,
}: {
  user: PublicUser;
  isOpen: boolean;
  activeTab: ProfileDialogTab;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tab: ProfileDialogTab) => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
}) {
  const initials = getInitials(user);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(680px,calc(100dvh-2rem))] max-w-230 flex-col gap-0 overflow-hidden rounded-none border border-foreground bg-card p-0 ring-0 shadow-none sm:max-w-230">
        <VisuallyHidden.Root>
          <DialogTitle>Account Settings</DialogTitle>
        </VisuallyHidden.Root>

        <Tabs
          orientation="vertical"
          value={activeTab}
          onValueChange={(value) => {
            const nextTab = parseProfileDialogTab(value);

            if (nextTab) {
              onTabChange(nextTab);
            }
          }}
          className="h-full w-full flex-col gap-0 md:flex-row"
        >
          <aside className="flex w-full shrink-0 flex-col border-b border-foreground bg-card p-5 md:w-65 md:border-b-0 md:border-r">
            <div className="flex items-center gap-3 md:flex-col md:items-start md:text-left">
              <Avatar className="size-14 shrink-0">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-foreground text-background font-mono text-sm font-medium tracking-[0.06em] uppercase">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 md:w-full">
                <p className="truncate font-serif-display text-lg leading-tight text-title">
                  {user.name}
                </p>
                <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div
              className="my-5 h-px w-full bg-foreground"
              aria-hidden="true"
            />

            <div className="flex flex-1 flex-col gap-4">
              <div>
                <p className="px-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Settings
                </p>
                <ProfileTabsList />
              </div>

              <Button
                type="button"
                variant="auth-destructive"
                size="auth-sm"
                className="mt-auto w-full justify-start gap-2.5 px-3 py-2.5"
                onClick={onSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="size-4" aria-hidden="true" />
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto bg-card">
            <ProfileTabPanel user={user} />
            <SecurityTabPanel
              user={user}
              isOpen={isOpen}
              isActive={activeTab === "security"}
            />
            <SessionsTabPanel
              isOpen={isOpen}
              isActive={activeTab === "sessions"}
            />
            <LinksTabPanel
              user={user}
              isOpen={isOpen}
              isActive={activeTab === "links"}
            />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
