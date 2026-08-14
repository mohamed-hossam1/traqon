"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldAlert, Mail, Copy, Check, LogOut, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signOut } from "@/actions/auth";
import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/session";
import { useQueryClient } from "@tanstack/react-query";
import { accountQueryKey, sessionQueryKey } from "@/lib/reactQuery/query-keys";

function BannedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: sessionData } = useSession();
  const [copied, setCopied] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const queryReason = searchParams?.get("reason");
  const banReason = queryReason || sessionData?.banReason || null;

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      toast.success("Support email copied to clipboard", {
        position: "top-center",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy email", { position: "top-center" });
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      void signOut().catch(() => {});
      queryClient.removeQueries({ queryKey: sessionQueryKey });
      queryClient.removeQueries({ queryKey: accountQueryKey });
    } finally {
      window.location.assign(ROUTES.LOGIN);
    }
  };

  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
    "Account Suspension Appeal",
  )}&body=${encodeURIComponent(
    "Hello Support Team,\n\nMy account has been suspended and I would like to request a review of my account status.\n\nThank you.",
  )}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl p-8 relative z-10 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            Account Suspended
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your account has been suspended due to a violation of our terms or safety guidelines.
          </p>
        </div>

        {banReason && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left space-y-1 text-xs">
            <span className="font-semibold text-destructive uppercase tracking-wider block">
              Reason for Ban:
            </span>
            <p className="text-foreground/90 font-mono break-words">
              {banReason}
            </p>
          </div>
        )}

        <div className="bg-muted/40 border border-border/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
            <LifeBuoy className="w-4 h-4 text-primary" />
            <span>Need Help? Contact Support</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              asChild
              className="w-full h-11 font-medium gap-2 shadow-sm"
            >
              <a href={mailtoUrl} target="_blank" rel="noopener noreferrer">
                <Mail className="w-4 h-4" />
                Contact via Email
              </a>
            </Button>

            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-background border border-border/80 rounded-lg text-xs font-mono text-muted-foreground">
              <span className="truncate select-all">{supportEmail}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleCopyEmail}
                title="Copy Email"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground text-xs gap-2"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="w-3.5 h-3.5" />
            {isSigningOut ? "Signing out..." : "Sign in with another account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BannedPage() {
  return (
    <Suspense fallback={null}>
      <BannedContent />
    </Suspense>
  );
}
