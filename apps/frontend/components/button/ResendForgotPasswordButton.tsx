"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";

type ResendForgotPasswordButtonProps = {
  email: string;
  cooldownSeconds?: number;
};

export function ResendForgotPasswordButton({
  email,
  cooldownSeconds = 60,
}: ResendForgotPasswordButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { secondsLeft, start, isCoolingDown } = useCountdown(cooldownSeconds);

  const handleResend = () => {
    if (isPending || isCoolingDown) return;

    startTransition(async () => {
      const result = await forgotPassword({ email });

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
    ? "Sending password reset email"
    : isCoolingDown
      ? `Resend available in ${secondsLeft} seconds`
      : "Resend reset link";

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
        <span aria-hidden="true">Resend reset link</span>
      )}
    </Button>
  );
}
