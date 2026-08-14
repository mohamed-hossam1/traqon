"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  onRevocation,
  REVOCATION_CHANNEL_NAME,
  REVOCATION_STORAGE_KEY,
} from "@/lib/auth/revocation";
import { setAccessToken } from "@/lib/api/client";

export function RevocationListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const handleRevoke = () => {
      void setAccessToken(null);
      try {
        void queryClient.cancelQueries();
        queryClient.clear();
      } catch {}
      router.replace(ROUTES.LOGIN);
    };

    const unsubscribeLocal = onRevocation(handleRevoke);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel(REVOCATION_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === "REVOKED") {
          handleRevoke();
        }
      };
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === REVOCATION_STORAGE_KEY && e.newValue) {
        handleRevoke();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribeLocal();
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [queryClient, router]);

  return null;
}
