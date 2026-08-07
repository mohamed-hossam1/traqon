export const CACHE_KEYS = {
  usersCollection: 'cache:collection:users',
  sessionsCollection: 'cache:collection:sessions',

  userEntity: (userId: string) => `cache:user:entity:${userId}`,
  userProfile: (userId: string) =>
    `cache:endpoint:GET:/users/me:user:${userId}`,
  userProfileApi: (userId: string) =>
    `cache:endpoint:GET:/api/users/me:user:${userId}`,
  userDetail: (userId: string) => `cache:user:detail:${userId}`,
  userSessions: (userId: string) => `cache:user:sessions:${userId}`,

  endpoint: (method: string, path: string, scope: string) =>
    `cache:endpoint:${method}:${path}:${scope}`,
} as const;

export type CacheKeys = typeof CACHE_KEYS;
