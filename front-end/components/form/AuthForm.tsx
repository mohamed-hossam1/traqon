"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/form/auth-card";
import { AuthFieldLabel, AuthInput } from "@/components/form/auth-field-label";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldContent,
} from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { LoginSchema, RegisterSchema } from "@/lib/zodSchema/auth-schema";
import { login, register } from "@/actions/auth";
import { accountQueryKey, sessionQueryKey } from "@/lib/reactQuery/query-keys";
import { useQueryClient } from "@tanstack/react-query";

type AuthFormProps = {
  defaultValues: {
    email: string;
    password: string;
    name?: string;
  };
  formType: "LOGIN" | "REGISTER";
};

function resolveNextRedirect(raw: string | null): string {
  if (!raw) return ROUTES.DASHBOARD;
  if (!raw.startsWith("/")) return ROUTES.DASHBOARD;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return ROUTES.DASHBOARD;
  if (raw.includes("\\")) return ROUTES.DASHBOARD;
  if (
    raw === ROUTES.LOGIN ||
    raw === ROUTES.REGISTER ||
    raw.startsWith(`${ROUTES.LOGIN}?`) ||
    raw.startsWith(`${ROUTES.REGISTER}?`)
  ) {
    return ROUTES.DASHBOARD;
  }
  return raw;
}

export function AuthForm({ defaultValues, formType }: AuthFormProps) {
  const isSignIn = formType === "LOGIN";
  const formId = "auth-form";
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const schema = isSignIn ? LoginSchema : RegisterSchema;

  const form = useForm<AuthFormProps["defaultValues"]>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function handleSubmit(data: AuthFormProps["defaultValues"]) {
    const result = await (isSignIn
      ? login(data as z.infer<typeof LoginSchema>)
      : register(data as z.infer<typeof RegisterSchema>));

    if (result?.serverError) {
      const errorMsg = result.serverError.message || "";
      const isBanned =
        errorMsg.toLowerCase().includes("banned") ||
        errorMsg.includes("ACCOUNT_BANNED");

      if (isBanned) {
        let banReason = "";
        if (errorMsg.includes(":")) {
          banReason = errorMsg.split(":").slice(1).join(":").trim();
        }
        const targetUrl = banReason
          ? `${ROUTES.BANNED}?reason=${encodeURIComponent(banReason)}`
          : ROUTES.BANNED;
        window.location.assign(targetUrl);
        return;
      }

      toast.error(result.serverError.message, { position: "top-center" });
      return;
    }
    toast.success(
      isSignIn
        ? "Successful login"
        : "Check your email and click the verification link to activate your account.",
      { position: "top-center" },
    );
    if (isSignIn) {
      queryClient.removeQueries({ queryKey: sessionQueryKey });
      queryClient.removeQueries({ queryKey: accountQueryKey });

      const loginResult = result?.data as { user?: { role?: string } } | undefined;
      if (loginResult?.user?.role === "admin") {
        router.replace(ROUTES.ADMIN);
        router.refresh();
        return;
      }

      const destination = resolveNextRedirect(
        searchParams?.get("next") ?? null,
      );
      router.replace(destination);
      router.refresh();
      return;
    }

    router.replace(
      `${ROUTES.VERIFY}?email=${encodeURIComponent(String(data.email))}`,
    );
  }

  function handleGoogleSignIn() {
    if (googleLoading) return;
    setGoogleLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    window.location.assign(`${apiUrl}/auth/google`);
  }

  return (
    <>
      <div className="flex flex-col items-center w-full justify-center">
        <AuthCard>
          <div className="flex flex-col gap-6">
            <Button
              type="button"
              variant="auth-outline"
              size="auth-lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || form.formState.isSubmitting}
            >
              <svg aria-hidden="true" className="size-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.7 1.22 9.2 3.2l6.88-6.88C35.9 2.1 30.3 0 24 0 14.6 0 6.56 5.4 2.64 13.3l7.98 6.2C12.5 12.7 17.8 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.14-2.8-.44-4.1H24v7.7h12.7c-.26 2.1-1.66 5.3-4.76 7.4l7.3 5.7c4.3-4 6.86-9.9 6.86-16.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.62 28.6c-.52-1.56-.82-3.22-.82-4.9s.3-3.34.8-4.9l-7.98-6.2C.92 15.9 0 19.8 0 23.7c0 3.9.92 7.8 2.62 11.1l8-6.2z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.3 0 11.6-2.1 15.46-5.7l-7.3-5.7c-2 1.4-4.66 2.3-8.16 2.3-6.2 0-11.5-3.2-13.38-8.8l-8 6.2C6.56 42.6 14.6 48 24 48z"
                />
              </svg>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form
              id={formId}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <FieldGroup className="gap-5">
                {!isSignIn && (
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <AuthFieldLabel htmlFor="auth-name">
                          Name
                        </AuthFieldLabel>
                        <FieldContent>
                          <AuthInput
                            {...field}
                            id="auth-name"
                            aria-invalid={fieldState.invalid}
                            placeholder="Enter your name"
                            autoComplete="name"
                          />
                          {fieldState.invalid && (
                            <FieldError
                              className="mt-2 font-serif-body italic text-destructive text-sm"
                              errors={[fieldState.error]}
                            />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                )}

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <AuthFieldLabel htmlFor="auth-email">
                        Email
                      </AuthFieldLabel>
                      <FieldContent>
                        <AuthInput
                          {...field}
                          id="auth-email"
                          type="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your email"
                          autoComplete="email"
                        />
                        {fieldState.invalid && (
                          <FieldError
                            className="mt-2 font-serif-body italic text-destructive text-sm"
                            errors={[fieldState.error]}
                          />
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <AuthFieldLabel htmlFor="auth-password">
                        Password
                      </AuthFieldLabel>
                      <FieldContent className="relative">
                        <AuthInput
                          {...field}
                          id="auth-password"
                          type={showPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                          placeholder={
                            isSignIn
                              ? "Your password"
                              : "Create a strong password"
                          }
                          autoComplete={
                            isSignIn ? "current-password" : "new-password"
                          }
                          className="pr-10"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtitle hover:text-foreground cursor-pointer"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          aria-pressed={showPassword}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </FieldContent>
                      {fieldState.invalid && (
                        <FieldError
                          className="mt-2 font-serif-body italic text-destructive text-sm"
                          errors={[fieldState.error]}
                        />
                      )}
                    </Field>
                  )}
                />

                {isSignIn && (
                  <div className="flex justify-end mt-1">
                    <Link
                      href={ROUTES.FORGOTPASSWORD}
                      className="font-mono text-[11px] uppercase tracking-widest text-accent hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </FieldGroup>

              <Button
                type="submit"
                variant="auth"
                size="auth-lg"
                className="mt-2"
                disabled={form.formState.isSubmitting || googleLoading}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : isSignIn ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </div>
        </AuthCard>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center mt-6 text-center">
        <p className="text-sm font-serif-body italic text-muted-foreground">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
        </p>
        <Link
          href={isSignIn ? ROUTES.REGISTER : ROUTES.LOGIN}
          className="text-sm font-serif-body not-italic text-accent hover:underline font-bold"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Link>
      </div>
    </>
  );
}
