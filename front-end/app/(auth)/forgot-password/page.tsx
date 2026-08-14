import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/form/ForgotPasswordForm";
import { AuthFormSkeleton } from "@/components/skeletons/AuthFormSkeleton";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-6 justify-center">
      <div className="w-full text-center">
        <h1 className="font-serif-display italic text-3xl text-title">
          Forgot your password?
        </h1>
        <p className="font-serif-body italic text-sm text-subtitle mt-1">
          Enter the email linked to your account and we&apos;ll send you a
          reset link.
        </p>
      </div>
      <div className="w-full">
        <Suspense fallback={<AuthFormSkeleton />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
