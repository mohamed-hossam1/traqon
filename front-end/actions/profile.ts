"use server";

import z from "zod";
import { apiClient, setAccessToken } from "@/lib/api/client";
import { actionClient } from "@/lib/next-action-handler/safe-action";
import {
  RevokeSessionSchema,
  SetPasswordSchema,
  UpdateProfileSchema,
} from "@/lib/zodSchema/profile-schema";
import type {
  AuthenticatedContext,
  PublicSession,
  PublicUser,
} from "@/types/auth";

export const getCurrentSession = actionClient
  .metadata({ actionName: "profile.getCurrentSession" })
  .action(async (): Promise<AuthenticatedContext | null> => {
    try {
      const data = await apiClient.get<{
        user: {
          id: string;
          sessionId?: string;
          email: string;
          name?: string | null;
          avatarUrl?: string | null;
          isVerified?: boolean;
          role?: "user" | "admin";
          createdAt: string;
          updatedAt: string;
          hasPassword?: boolean;
        };
      }>("/users/me");

      const user = data?.user;
      if (!user?.id) {
        await setAccessToken(null);
        return null;
      }

      const publicUser: PublicUser = {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        emailVerified: Boolean(user.isVerified),
        image: user.avatarUrl ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        hasPassword: user.hasPassword,
        role: user.role,
      };

      const session: PublicSession = {
        id: user.sessionId ?? user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        expiresAt: "",
        ipAddress: null,
        userAgent: null,
      };
      return { session, user: publicUser, isBanned: false, banReason: null };
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const message = err?.message || "";
      const isBannedError =
        err?.status === 403 ||
        message.toLowerCase().includes("banned") ||
        message.includes("ACCOUNT_BANNED");

      if (isBannedError) {
        let banReason: string | null = null;
        if (message.includes(":")) {
          const parts = message.split(":");
          banReason = parts.slice(1).join(":").trim();
        }
        return {
          session: null,
          user: null,
          isBanned: true,
          banReason: banReason || null,
        };
      }

      await setAccessToken(null);
      return null;
    }
  });

export const updateProfile = actionClient
  .metadata({ actionName: "profile.updateProfile" })
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.patch("/users/me", parsedInput);
  });

export const hasPassword = actionClient
  .metadata({ actionName: "profile.hasPassword" })
  .action(async () => {
    const data = await apiClient.get<{ user: { hasPassword: boolean } }>(
      "/users/me",
    );
    return data?.user?.hasPassword ?? false;
  });

export const sendCurrentUserPasswordResetEmail = actionClient
  .metadata({ actionName: "profile.sendCurrentUserPasswordResetEmail" })
  .action(async () => {
    try {
      const data = await apiClient.get<{ user: { email: string } }>(
        "/users/me",
      );
      if (data?.user?.email) {
        await apiClient.post("/auth/forgot-password", {
          email: data.user.email,
        });
      }
    } catch {}

    return {
      message: "If your account is valid, a reset email was sent.",
    };
  });

const ChangePasswordInputSchema = z.object({
  oldPassword: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6),
  revokeOtherSessions: z.boolean().optional(),
});

export const changePassword = actionClient
  .metadata({ actionName: "profile.changePassword" })
  .inputSchema(ChangePasswordInputSchema)
  .action(async ({ parsedInput }) => {
    const oldPassword = parsedInput.oldPassword ?? parsedInput.currentPassword;
    return await apiClient.post("/auth/change-password", {
      oldPassword,
      newPassword: parsedInput.newPassword,
      revokeOtherSessions: parsedInput.revokeOtherSessions ?? false,
    });
  });

export const setPassword = actionClient
  .metadata({ actionName: "profile.setPassword" })
  .inputSchema(SetPasswordSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post("/auth/set-password", parsedInput);
  });

export const listSessionsPublic = actionClient
  .metadata({ actionName: "profile.listSessionsPublic" })
  .action(async () => {
    const data = await apiClient.get<{
      sessions: Array<{
        sessionId: string;
        userAgent?: string;
        ipAddress?: string;
        isCurrentSession: boolean;
        createdAt: string;
        lastUsedAt: string;
      }>;
    }>("/auth/sessions");

    return (data?.sessions ?? []).map((s) => ({
      id: s.sessionId,
      createdAt: s.createdAt,
      updatedAt: s.lastUsedAt,
      expiresAt: "",
      ipAddress: s.ipAddress ?? null,
      userAgent: s.userAgent ?? null,
      isCurrent: s.isCurrentSession,
    }));
  });

export const revokeSessionById = actionClient
  .metadata({ actionName: "profile.revokeSessionById" })
  .inputSchema(RevokeSessionSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post("/auth/sessions/revoke", {
      sessionId: parsedInput.sessionId,
    });
  });

export const revokeAllOtherSessions = actionClient
  .metadata({ actionName: "profile.revokeAllOtherSessions" })
  .action(async () => {
    return await apiClient.post("/auth/sessions/revoke-all");
  });

export const deleteAccount = actionClient
  .metadata({ actionName: "profile.deleteAccount" })
  .action(async () => {
    return await apiClient.delete("/users/me");
  });
