"use client";

import { Button } from "@/components/ui/button";

export function TablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <Button
        variant="auth-outline"
        size="auth-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </Button>
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="auth-outline"
        size="auth-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}
