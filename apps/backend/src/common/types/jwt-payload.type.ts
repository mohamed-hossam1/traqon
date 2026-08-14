import type { UserRole } from 'src/db/schema';

export type JwtPayload = {
  userId: string;
  role: UserRole;
  av: number;
  sessionId: string;
};

export type RefreshJwtPayload = JwtPayload;
