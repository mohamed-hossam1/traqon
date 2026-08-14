import type { QueryClient } from "@tanstack/react-query";
import { setAccessToken } from "@/lib/api/client";

const REVOCATION_CHANNEL_NAME = "project_name_auth_revocation";
const REVOCATION_STORAGE_KEY = "project_name_session_revoked_at";

type RevocationCallback = () => void;
const listeners = new Set<RevocationCallback>();

export function onRevocation(callback: RevocationCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function triggerGlobalRevocation(queryClient?: QueryClient) {
  void setAccessToken(null);

  if (queryClient) {
    try {
      void queryClient.cancelQueries();
      queryClient.clear();
    } catch {}
  }

  if (typeof window !== "undefined") {
    try {
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(REVOCATION_CHANNEL_NAME);
        channel.postMessage({ type: "REVOKED", timestamp: Date.now() });
        channel.close();
      }
      localStorage.setItem(REVOCATION_STORAGE_KEY, Date.now().toString());
    } catch {}
  }

  for (const callback of listeners) {
    try {
      callback();
    } catch {}
  }
}

export { REVOCATION_CHANNEL_NAME, REVOCATION_STORAGE_KEY };
