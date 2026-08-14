import { Suspense } from "react";

import { AuthForm } from "@/components/form/AuthForm";
import { AuthFormSkeleton } from "@/components/skeletons/AuthFormSkeleton";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center gap-6 justify-center">
      <div className="w-full text-center">
        <h1 className="font-serif-display italic text-3xl text-title">
          Register your account
        </h1>
        <p className="font-serif-body italic text-sm text-subtitle mt-1">
          Please fill in the following information to register your account.
        </p>
      </div>
      <div className="w-full">
        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm
            formType="REGISTER"
            defaultValues={{
              name: "",
              email: "",
              password: "",
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
