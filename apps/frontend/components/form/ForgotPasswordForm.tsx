"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { forgotPassword } from "@/actions/auth";
import { ROUTES } from "@/constants/routes";
import { ForgotPasswordSchema } from "@/lib/zodSchema/auth-schema";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/form/auth-card";
import { AuthFieldLabel, AuthInput } from "@/components/form/auth-field-label";
import { ResendForgotPasswordButton } from "@/components/button/ResendForgotPasswordButton";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

export function ForgotPasswordForm() {
  const formId = "forgot-password-form";
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof ForgotPasswordSchema>) {
    const result = await forgotPassword(data);

    if (result?.serverError) {
      toast.error(result.serverError.message, { position: "top-center" });
      return;
    }

    setSubmittedEmail(data.email);
    form.reset({ email: data.email });
    toast.success("If the email exists, a password reset link has been sent.", {
      position: "top-center",
    });
  }

  if (submittedEmail) {
    return (
      <>
        <div className="flex flex-col items-center w-full justify-center">
          <AuthCard>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <MailCheck
                  className="size-5 text-accent"
                  aria-hidden="true"
                />
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Email sent
                </span>
              </div>

              <p className="font-serif-body italic text-sm text-subtitle">
                If an account exists for this email, we sent a password reset
                link to the inbox below.
              </p>

              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Sent to
                </span>
                <p className="border border-foreground bg-background px-3 py-2 font-mono text-sm text-foreground break-all">
                  {submittedEmail}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <ResendForgotPasswordButton email={submittedEmail} />
                <Button
                  type="button"
                  variant="auth-outline"
                  size="auth-lg"
                  onClick={() => {
                    form.reset({ email: "" });
                    setSubmittedEmail(null);
                  }}
                >
                  Try another email
                </Button>
              </div>
            </div>
          </AuthCard>
        </div>
      </>
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
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <AuthFieldLabel htmlFor="forgot-password-email">
                        Email
                      </AuthFieldLabel>
                      <FieldContent>
                        <AuthInput
                          {...field}
                          id="forgot-password-email"
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
              </FieldGroup>

              <Button
                type="submit"
                variant="auth"
                size="auth-lg"
                className="mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
        </AuthCard>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center mt-6 text-center">
        <p className="text-sm font-serif-body italic text-muted-foreground">
          Remembered your password?
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="text-sm font-serif-body not-italic text-accent hover:underline font-bold"
        >
          Sign in
        </Link>
      </div>
    </>
  );
}
