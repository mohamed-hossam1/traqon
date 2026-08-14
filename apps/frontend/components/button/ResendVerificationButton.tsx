"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resendVerification } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";

type ResendVerificationButtonProps = {
  email: string;
  cooldownSeconds?: number;
};

export function ResendVerificationButton({
  email,
  cooldownSeconds = 60,
}: ResendVerificationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { secondsLeft, start, isCoolingDown } = useCountdown(cooldownSeconds);

  const handleResend = () => {
    if (isPending || isCoolingDown) return;

    startTransition(async () => {
      const result = await resendVerification({ email });

      if (result?.serverError) {
        toast.error(result.serverError!.message, { position: "top-center" });
        return;
      }

      toast.success(result?.data?.message, { position: "top-center" });
      start();
    });
  };

  const disabled = isPending || isCoolingDown;

  const accessibleName = isPending
    ? "Sending verification email"
    : isCoolingDown
      ? `Resend available in ${secondsLeft} seconds`
      : "Resend verification email";

  return (
    <Button
      type="button"
      variant="auth"
      size="auth-lg"
      onClick={handleResend}
      disabled={disabled}
      aria-label={accessibleName}
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="animate-spin size-4" />
      ) : isCoolingDown ? (
        <span aria-hidden="true">{`Resend available in ${secondsLeft}s`}</span>
      ) : (
        <span aria-hidden="true">Resend verification email</span>
      )}
    </Button>
  );
}
