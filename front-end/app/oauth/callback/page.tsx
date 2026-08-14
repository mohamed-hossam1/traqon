"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");

    if (
      error === "account_banned" ||
      error === "user_banned" ||
      error?.toLowerCase().includes("banned")
    ) {
      const targetUrl = reason
        ? `${ROUTES.BANNED}?reason=${encodeURIComponent(reason)}`
        : ROUTES.BANNED;
      window.location.assign(targetUrl);
      return;
    }

    if (error === "google_email_mismatch") {
      toast.error("The Google account email must match your profile email.", {
        position: "top-center",
      });
    } else if (error === "google_already_linked_to_another_account") {
      toast.error(
        "This Google account is already linked to another user account.",
        { position: "top-center" },
      );
    } else if (error) {
      toast.error("Failed to connect Google account. Please try again.", {
        position: "top-center",
      });
    } else if (status === "linked") {
      toast.success("Google account linked successfully!", {
        position: "top-center",
      });
    } else if (status === "already_linked") {
      toast.info("This Google account is already linked to your profile.", {
        position: "top-center",
      });
    }

    router.replace(ROUTES.DASHBOARD);
  }, [router, searchParams]);

  return null;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
