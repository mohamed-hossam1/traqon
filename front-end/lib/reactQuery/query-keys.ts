export const sessionQueryKey = ["session"] as const;

export const accountQueryKey = ["account"] as const;
export const accountHasPasswordQueryKey = [
  ...accountQueryKey,
  "has-password",
] as const;
export const accountSessionsQueryKey = [
  ...accountQueryKey,
  "sessions",
] as const;
export const accountConnectionsQueryKey = [
  ...accountQueryKey,
  "connections",
] as const;

export const adminQueryKey = ["admin"] as const;
export const adminUsersQueryKey = [...adminQueryKey, "users"] as const;
export const adminUserDetailQueryKey = (id: string) =>
  [...adminQueryKey, "users", id] as const;
export const adminUserSessionsQueryKey = (id: string) =>
  [...adminQueryKey, "users", id, "sessions"] as const;
export const adminAuditLogsQueryKey = [...adminQueryKey, "audit-logs"] as const;