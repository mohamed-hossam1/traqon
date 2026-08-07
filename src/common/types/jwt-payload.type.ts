import type { UserRole } from 'src/db/schema';

export type JwtPayload = {
  userId: string;
  email: string;
  name: string | null;
  role: UserRole;
  sessionId?: string;
};

export type RefreshJwtPayload = JwtPayload & {
  sessionId: string;
};
