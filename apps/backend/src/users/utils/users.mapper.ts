import { type User, type UserBan } from 'src/db/schema';
import { BanRecord, PublicUser } from 'src/common/types';

export type { BanRecord, PublicUser };

export function toPublicUser(
  user: User,
  ban: UserBan | null,
  banHistory: UserBan[] = [],
): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isVerified: user.isVerified,
    isBanned: user.isBanned,
    hasPassword: user.passwordHash !== null,
    createdAt: user.createdAt.toISOString(),
    ban: ban
      ? {
          id: ban.id,
          bannedAt: ban.bannedAt,
          unbannedAt: ban.unbannedAt ?? null,
          banReason: ban.banReason,
        }
      : null,
    banHistory: banHistory.map((b) => ({
      id: b.id,
      bannedAt: b.bannedAt,
      unbannedAt: b.unbannedAt ?? null,
      banReason: b.banReason,
    })),
  };
}
