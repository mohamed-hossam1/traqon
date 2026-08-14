import { Suspense } from "react";

import { AuthForm } from "@/components/form/AuthForm";
import { AuthFormSkeleton } from "@/components/skeletons/AuthFormSkeleton";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-6 justify-center">
      <div className="w-full text-center">
        <h1 className="font-serif-display italic text-3xl text-title">Welcome back</h1>
        <p className="font-serif-body italic text-sm text-subtitle mt-1">
          Sign in with your email and password to continue.
        </p>
      </div>
      <div className="w-full">
        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm
            formType="LOGIN"
            defaultValues={{
              email: "",
              password: "",
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
