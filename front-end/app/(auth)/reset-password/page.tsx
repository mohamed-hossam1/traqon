import { Suspense } from "react";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/form/ResetPasswordForm";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/button.variants";
import { AuthCard } from "@/components/form/auth-card";
import { ResetPasswordSkeleton } from "@/components/skeletons/ResetPasswordSkeleton";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[] | undefined;
    error?: string | string[] | undefined;
    type?: string | undefined;
  }>;
};

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
  const { token, error, type } = await searchParams;
  const resetToken = Array.isArray(token) ? token[0] : token;
  const resetError = Array.isArray(error) ? error[0] : error;
  const resetType = type;

  const isSettingPassword = resetType === "reset";

  const heading = isSettingPassword ? "Set a password" : "Reset your password";
  const subheading = isSettingPassword
    ? "Create a password for your account. You can use it to sign in alongside your social login."
    : "Choose a new password to restore access to your account.";

  if (!resetToken || resetError === "INVALID_TOKEN") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center gap-6 justify-center">
        <div className="w-full text-center">
          <h1 className="font-serif-display italic text-3xl text-title">
            {heading}
          </h1>
          <p className="font-serif-body italic text-sm text-subtitle mt-1">
            {subheading}
          </p>
        </div>

        <div className="flex flex-col items-center w-full justify-center">
          <AuthCard>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent-foreground bg-accent px-2 py-0.75">
                  Link expired
                </span>
              </div>

              <p className="font-serif-body italic text-sm text-subtitle">
                This link is invalid or has expired.
                {isSettingPassword
                  ? " Go back to your profile settings and try again."
                  : " Request a new one to continue."}
              </p>

              <div className="flex flex-col gap-3">
                {isSettingPassword ? (
                  <Link
                    href={`${ROUTES.DASHBOARD}?open=security`}
                    className={buttonVariants({ variant: "auth", size: "auth-md" })}
                  >
                    Back to security settings
                  </Link>
                ) : (
                  <>
                    <Link
                      href={ROUTES.FORGOTPASSWORD}
                      className={buttonVariants({ variant: "auth", size: "auth-md" })}
                    >
                      Request a new link
                    </Link>
                    <Link
                      href={ROUTES.LOGIN}
                      className={buttonVariants({ variant: "auth-outline", size: "auth-md" })}
                    >
                      Back to sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-6 justify-center">
      <div className="w-full text-center">
        <h1 className="font-serif-display italic text-3xl text-title">
          {heading}
        </h1>
        <p className="font-serif-body italic text-sm text-subtitle mt-1">
          {subheading}
        </p>
      </div>

      <div className="w-full">
        <ResetPasswordForm token={resetToken} type={resetType} />
      </div>
    </div>
  );
}
