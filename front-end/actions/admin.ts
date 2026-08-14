"use server";

import { apiClient } from "@/lib/api/client";
import { actionClient } from "@/lib/next-action-handler/safe-action";
import {
  ListUsersQuerySchema,
  GetUserSchema,
  BanUserSchema,
  UnbanUserSchema,
  ChangeRoleSchema,
  ListUserSessionsSchema,
  RevokeSessionSchema,
  ListAuditLogsQuerySchema,
} from "@/lib/zodSchema/admin-schema";
import type {
  ListUsersResponse,
  ListUserSessionsResponse,
  AdminPublicUser,
  ListAuditLogsResponse,
} from "@/types/admin";

export const listUsers = actionClient
  .metadata({ actionName: "admin.listUsers" })
  .inputSchema(ListUsersQuerySchema)
  .action(async ({ parsedInput }) => {
    const params = new URLSearchParams();
    if (parsedInput.page) params.set("page", String(parsedInput.page));
    if (parsedInput.limit) params.set("limit", String(parsedInput.limit));
    if (parsedInput.search) params.set("search", parsedInput.search);
    if (parsedInput.status) params.set("status", parsedInput.status);
    if (parsedInput.role) params.set("role", parsedInput.role);
    if (parsedInput.sortBy) params.set("sortBy", parsedInput.sortBy);
    if (parsedInput.sortOrder) params.set("sortOrder", parsedInput.sortOrder);
    const query = params.toString();
    return await apiClient.get<ListUsersResponse>(`/users${query ? `?${query}` : ""}`);
  });

export const getUserById = actionClient
  .metadata({ actionName: "admin.getUserById" })
  .inputSchema(GetUserSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.get<{ user: AdminPublicUser }>(`/users/${parsedInput.id}`);
  });

export const banUser = actionClient
  .metadata({ actionName: "admin.banUser" })
  .inputSchema(BanUserSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post(`/users/${parsedInput.id}/ban`, {
      banReason: parsedInput.banReason,
    });
  });

export const unbanUser = actionClient
  .metadata({ actionName: "admin.unbanUser" })
  .inputSchema(UnbanUserSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post(`/users/${parsedInput.id}/unban`);
  });

export const changeUserRole = actionClient
  .metadata({ actionName: "admin.changeUserRole" })
  .inputSchema(ChangeRoleSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post(`/users/${parsedInput.id}/role`, {
      role: parsedInput.role,
    });
  });

export const listUserSessions = actionClient
  .metadata({ actionName: "admin.listUserSessions" })
  .inputSchema(ListUserSessionsSchema)
  .action(async ({ parsedInput }) => {
    const params = new URLSearchParams();
    if (parsedInput.page) params.set("page", String(parsedInput.page));
    if (parsedInput.limit) params.set("limit", String(parsedInput.limit));
    const query = params.toString();
    return await apiClient.get<ListUserSessionsResponse>(
      `/users/${parsedInput.id}/sessions${query ? `?${query}` : ""}`,
    );
  });

export const adminRevokeSession = actionClient
  .metadata({ actionName: "admin.revokeSession" })
  .inputSchema(RevokeSessionSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post(
      `/users/${parsedInput.userId}/sessions/${parsedInput.sessionId}/revoke`,
    );
  });

export const listAuditLogs = actionClient
  .metadata({ actionName: "admin.listAuditLogs" })
  .inputSchema(ListAuditLogsQuerySchema)
  .action(async ({ parsedInput }) => {
    const params = new URLSearchParams();
    if (parsedInput.page) params.set("page", String(parsedInput.page));
    if (parsedInput.limit) params.set("limit", String(parsedInput.limit));
    if (parsedInput.action) params.set("action", parsedInput.action);
    if (parsedInput.adminId) params.set("adminId", parsedInput.adminId);
    if (parsedInput.targetUserId) params.set("targetUserId", parsedInput.targetUserId);
    const query = params.toString();
    return await apiClient.get<ListAuditLogsResponse>(
      `/users/audit-logs${query ? `?${query}` : ""}`,
    );
  });

