"use client";

import { useSession } from "@/hooks/session";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";

export function BannedGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (session?.isBanned && pathname !== ROUTES.BANNED) {
      const reason = session.banReason
        ? `?reason=${encodeURIComponent(session.banReason)}`
        : "";
      window.location.assign(`${ROUTES.BANNED}${reason}`);
    }
  }, [session, pathname]);

  return <>{children}</>;
}
