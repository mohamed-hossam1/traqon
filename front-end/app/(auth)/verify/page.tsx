import { Suspense } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/components/form/auth-card";
import { buttonVariants } from "@/components/ui/button.variants";
import { ResendVerificationButton } from "@/components/button/ResendVerificationButton";
import { TokenVerifier } from "@/components/auth/TokenVerifier";
import { AuthFormSkeleton } from "@/components/skeletons/AuthFormSkeleton";

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string | string[] | undefined;
    token?: string | string[] | undefined;
  }>;
};

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-6 justify-center">
      <div className="w-full text-center">
        <h1 className="font-serif-display italic text-3xl text-title">
          Verify your email
        </h1>
        <p className="font-serif-body italic text-sm text-subtitle mt-1">
          We sent you a verification link. Open it to activate your account
          and finish signing in.
        </p>
      </div>

      <div className="flex flex-col items-center w-full justify-center">
        <AuthCard>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <MailCheck className="size-5 text-accent" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Awaiting confirmation
              </span>
            </div>

            <Suspense fallback={<AuthFormSkeleton />}>
              <VerifyActions searchParams={searchParams} />
            </Suspense>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}

async function VerifyActions({ searchParams }: VerifyPageProps) {
  const { email, token } = await searchParams;
  const userEmail = Array.isArray(email) ? email[0] : email;
  const tokenValue = Array.isArray(token) ? token[0] : token;

  if (tokenValue) {
    return <TokenVerifier token={tokenValue} />;
  }

  return (
    <>
      <p className="font-serif-body italic text-sm text-subtitle">
        Use the link in your inbox to confirm your email address. The
        verification email can take a minute to arrive.
      </p>

      {userEmail ? (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Sent to
          </span>
          <p className="border border-foreground bg-background px-3 py-2 font-mono text-sm text-foreground break-all">
            {userEmail}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {userEmail ? (
          <ResendVerificationButton email={userEmail} />
        ) : (
          <Link
            href={ROUTES.LOGIN}
            className={buttonVariants({ variant: "auth", size: "auth-lg" })}
          >
            Back to sign in
          </Link>
        )}
        <Link
          href={ROUTES.REGISTER}
          className={buttonVariants({ variant: "auth-outline", size: "auth-lg" })}
        >
          Use another email
        </Link>
      </div>
    </>
  );
}
