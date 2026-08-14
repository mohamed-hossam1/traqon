"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { resetPassword } from "@/actions/auth";
import { ROUTES } from "@/constants/routes";
import { ResetPasswordSchema } from "@/lib/zodSchema/auth-schema";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button.variants";
import { AuthCard } from "@/components/form/auth-card";
import { AuthFieldLabel, AuthInput } from "@/components/form/auth-field-label";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

type ResetPasswordFormProps = {
  token: string;
  type?: string;
};

export function ResetPasswordForm({ token, type }: ResetPasswordFormProps) {
  const isSettingPassword = type === "reset";
  const formId = "reset-password-form";
  const [showPassword, setShowPassword] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
      password: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof ResetPasswordSchema>) {
    const result = await resetPassword(data);

    if (result?.serverError) {
      toast.error(result.serverError.message, { position: "top-center" });
      return;
    }

    setIsComplete(true);
    toast.success("Your password has been reset.", {
      position: "top-center",
    });
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center w-full justify-center">
        <AuthCard>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <CheckCircle2
                className="size-5 text-accent"
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {isSettingPassword ? "Password set" : "Password updated"}
              </span>
            </div>

            <p className="font-serif-body italic text-sm text-subtitle">
              {isSettingPassword
                ? "Your password has been set. You can now sign in with it or continue using your social account."
                : "Your password was updated successfully. You can sign in with the new password now."}
            </p>

              {isSettingPassword ? (
                <Link
                  href={`${ROUTES.DASHBOARD}?open=security`}
                  className={buttonVariants({ variant: "auth", size: "auth-md" })}
                >
                  Back to security settings
                </Link>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  className={buttonVariants({ variant: "auth", size: "auth-md" })}
                >
                  Go to sign in
                </Link>
              )}
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center w-full justify-center">
        <AuthCard>
            <form
              id={formId}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <FieldGroup className="gap-5">
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <AuthFieldLabel htmlFor="reset-password">
                        New password
                      </AuthFieldLabel>
                      <FieldContent className="relative">
                        <AuthInput
                          {...field}
                          id="reset-password"
                          type={showPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                          placeholder="Create a new password"
                          autoComplete="new-password"
                          className="pr-10"
                        />

                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtitle hover:text-foreground cursor-pointer"
                          onClick={() => setShowPassword((prev) => !prev)}
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
              </FieldGroup>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  type="submit"
                  variant="auth"
                  size="auth-lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Update password"
                  )}
                </Button>
                {isSettingPassword ? (
                  <Link
                    href={`${ROUTES.DASHBOARD}?open=security`}
                    className={buttonVariants({ variant: "auth-outline", size: "auth-md" })}
                  >
                    Cancel
                  </Link>
                ) : (
                  <Link
                    href={ROUTES.LOGIN}
                    className={buttonVariants({ variant: "auth-outline", size: "auth-md" })}
                  >
                    Back to sign in
                  </Link>
                )}
              </div>
            </form>
        </AuthCard>
      </div>
    </>
  );
}
