"use client";

import {
  getBrowserInfo,
  getBrowserInformation,
} from "@/lib/visitorInfo/browserInfo";
import { DeviceIcon } from "@/lib/visitorInfo/DeviceIcon";
import type { PublicSession } from "@/types/auth";
import { Badge } from "@/components/profile/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export default function SessionCard({
  session,
  isCurrent = false,
  isRevoking,
  onRevoke,
}: {
  session: PublicSession;
  isCurrent?: boolean;
  isRevoking?: boolean;
  onRevoke?: () => void;
}) {
  const browserInfo = getBrowserInfo(session.userAgent);
  const label = getBrowserInformation(browserInfo);
  const signedInAt = session.createdAt
    ? formatDate(new Date(session.createdAt))
    : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-none border bg-card px-3 py-3 transition-colors",
        isCurrent
          ? "border-foreground border-l-4 border-l-accent"
          : "border-border",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-none border",
          isCurrent
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-foreground/70",
        )}
        aria-hidden="true"
      >
        <DeviceIcon device={browserInfo.device} className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-serif-body text-sm text-foreground">
            {label}
          </p>
          {isCurrent && <Badge>Current</Badge>}
        </div>
        {signedInAt && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Signed in · {signedInAt}
          </p>
        )}
      </div>

      {!isCurrent && onRevoke && (
        <Button
          type="button"
          variant="auth-destructive"
          size="auth-sm"
          className="self-start px-2 py-1 text-[10px]"
          aria-label={`Revoke session: ${label}`}
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {isRevoking ? "Revoking…" : "Revoke"}
        </Button>
      )}
    </div>
  );
}
