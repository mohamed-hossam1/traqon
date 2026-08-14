"use client";

import { signOut } from "@/actions/auth";
import { ProfileButton } from "@/components/button/ProfileButton";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { SessionActionsSkeleton } from "@/components/skeletons/SessionActionsSkeleton";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/session";
import { useProfileDialogUrlState } from "@/hooks/profile-dialog-url-state";

import { triggerGlobalRevocation } from "@/lib/auth/revocation";
import { useIsMounted } from "@/hooks/use-is-mounted";

import { useEffect } from "react";

export default function SessionActions() {
  const mounted = useIsMounted();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: authenticatedSession, isPending, isFetching } = useSession();
  const { isOpen, activeTab, openTab, closeDialog } =
    useProfileDialogUrlState();

  useEffect(() => {
    if (
      mounted &&
      !isPending &&
      (!authenticatedSession || !authenticatedSession.user) &&
      !authenticatedSession?.isBanned
    ) {
      triggerGlobalRevocation(queryClient);
      router.replace(ROUTES.LOGIN);
    }
  }, [mounted, isPending, authenticatedSession, queryClient, router]);

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const result = await signOut();

      if (result?.serverError) {
        throw new Error(result.serverError!.message || "Failed to sign out.");
      }
    },
    onSuccess: () => {
      triggerGlobalRevocation(queryClient);
      router.replace(ROUTES.LOGIN);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), {
        position: "top-center",
      });
    },
  });

  if (!mounted || isPending || authenticatedSession === undefined || (isFetching && !authenticatedSession)) {
    return <SessionActionsSkeleton />;
  }

  if (!authenticatedSession || !authenticatedSession.user || authenticatedSession.isBanned) {
    return (
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center justify-center rounded-none border border-foreground bg-foreground px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-background transition-colors duration-150 hover:bg-accent hover:border-accent hover:text-accent-foreground"
      >
        Sign In / Sign Up
      </Link>
    );
  }

  return (
    <>
      <ProfileButton
        user={authenticatedSession.user}
        isOpen={isOpen}
        onOpenProfile={() => openTab("profile")}
      />
      <ProfileDialog
        user={authenticatedSession.user}
        isOpen={isOpen}
        activeTab={activeTab}
        onOpenChange={(open) => {
          if (open) {
            openTab(activeTab);
            return;
          }

          closeDialog();
        }}
        onTabChange={openTab}
        onSignOut={() => signOutMutation.mutate()}
        isSigningOut={signOutMutation.isPending}
      />
    </>
  );
}
