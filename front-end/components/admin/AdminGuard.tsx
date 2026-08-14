"use client";

import { useSession } from "@/hooks/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && (!session || session.user?.role !== "admin")) {
      router.replace(ROUTES.LOGIN);
    }
  }, [mounted, isLoading, session, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-48 rounded-none bg-foreground/10" />
          <Skeleton className="h-4 w-full rounded-none bg-foreground/10" />
          <Skeleton className="h-4 w-3/4 rounded-none bg-foreground/10" />
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
