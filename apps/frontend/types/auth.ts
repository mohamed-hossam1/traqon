export type AuthUser = {
  id: string;
  email: string;
};

export type PublicSession = {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  isCurrent?: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  hasPassword?: boolean;
  role?: "user" | "admin";
};

export type AuthenticatedContext = {
  session: PublicSession | null;
  user: PublicUser | null;
  isBanned?: boolean;
  banReason?: string | null;
};
