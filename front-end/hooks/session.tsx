"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@/actions/profile";
import type { AuthenticatedContext } from "@/types/auth";
import { sessionQueryKey } from "@/lib/reactQuery/query-keys";

export function useSession() {
  return useQuery<AuthenticatedContext | null>({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const result = await getCurrentSession();
      if (result?.serverError) throw new Error(result.serverError?.message);
      return result?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
