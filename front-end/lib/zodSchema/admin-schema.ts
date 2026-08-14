import { z } from "zod";

export const ListUsersQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(100).optional(),
  status: z.enum(["active", "banned"]).optional(),
  role: z.enum(["user", "admin"]).optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const BanUserSchema = z.object({
  id: z.string().uuid(),
  banReason: z.string().min(1).max(500),
});

export const UnbanUserSchema = z.object({
  id: z.string().uuid(),
});

export const GetUserSchema = z.object({
  id: z.string().uuid(),
});

export const ListUserSessionsSchema = z.object({
  id: z.string().uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const RevokeSessionSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
});

export const ChangeRoleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

export const ListAuditLogsQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  action: z.string().optional(),
  adminId: z.string().uuid().optional(),
  targetUserId: z.string().uuid().optional(),
});

