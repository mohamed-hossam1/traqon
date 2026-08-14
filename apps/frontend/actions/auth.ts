"use server";

import z from "zod";
import { apiClient, setAccessToken } from "@/lib/api/client";
import { actionClient } from "@/lib/next-action-handler/safe-action";
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  ResendVerificationEmailSchema,
  VerifyEmailSchema,
} from "@/lib/zodSchema/auth-schema";

export const register = actionClient
  .metadata({ actionName: "auth.register" })
  .inputSchema(RegisterSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post("/auth/sign-up", parsedInput);
  });

export const login = actionClient
  .metadata({ actionName: "auth.login" })
  .inputSchema(LoginSchema)
  .action(async ({ parsedInput }) => {
    const result = await apiClient.post<{ accessToken?: string }>(
      "/auth/sign-in",
      parsedInput,
    );
    if (result.accessToken) await setAccessToken(result.accessToken);
    return result;
  });

export const forgotPassword = actionClient
  .metadata({ actionName: "auth.forgotPassword" })
  .inputSchema(ForgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    await apiClient.post("/auth/forgot-password", parsedInput);
    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  });

export const resetPassword = actionClient
  .metadata({ actionName: "auth.resetPassword" })
  .inputSchema(ResetPasswordSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post("/auth/reset-password", parsedInput);
  });

export const verifyEmail = actionClient
  .metadata({ actionName: "auth.verifyEmail" })
  .inputSchema(VerifyEmailSchema)
  .action(async ({ parsedInput }) => {
    const result = await apiClient.post<{ accessToken?: string }>(
      "/auth/verify-email",
      parsedInput,
    );
    if (result.accessToken) await setAccessToken(result.accessToken);
    return result;
  });

export const resendVerification = actionClient
  .metadata({ actionName: "auth.resendVerification" })
  .inputSchema(ResendVerificationEmailSchema)
  .action(async ({ parsedInput }) => {
    await apiClient.post("/auth/resend-verification-email", parsedInput);
    return {
      message:
        "If your email needs verification, a new verification link has been sent.",
    };
  });

export const listUserAccounts = actionClient
  .metadata({ actionName: "auth.listUserAccounts" })
  .action(async () => {
    const accounts =
      await apiClient.get<
        Array<{ id: string; provider: string; providerUserId: string }>
      >("/auth/accounts");

    return (accounts ?? []).map((acc) => ({
      id: acc.id,
      provider: acc.provider,
      providerId: acc.provider,
      providerUserId: acc.providerUserId,
    }));
  });

export const unLinkAccount = actionClient
  .metadata({ actionName: "auth.unlinkAccount" })
  .inputSchema(
    z.object({
      provider: z.string().optional(),
      providerId: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const provider = parsedInput.provider ?? parsedInput.providerId;
    return await apiClient.post("/auth/accounts/unlink", { provider });
  });

export const linkGoogleAccount = actionClient
  .metadata({ actionName: "auth.linkGoogleAccount" })
  .action(async () => {
    return await apiClient.get<{ url: string }>("/auth/google/link");
  });

export const signOut = actionClient
  .metadata({ actionName: "auth.signOut" })
  .action(async () => {
    const result = await apiClient.post("/auth/logout");
    await setAccessToken(null);
    return result;
  });
