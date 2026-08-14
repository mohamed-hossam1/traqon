import type { UserRole } from 'src/db/schema';

export type AuthUser = {
  id: string;
  role: UserRole;
  sessionId: string;
};
