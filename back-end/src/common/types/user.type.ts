import type { User } from 'src/db/schema';

export type BanRecord = {
  id: string;
  bannedAt: Date;
  unbannedAt: Date | null;
  banReason: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: User['role'];
  isVerified: boolean;
  isBanned: boolean;
  hasPassword: boolean;
  createdAt: string;
  ban: BanRecord | null;
  banHistory: BanRecord[];
};
