export type ParsedUserAgent = {
  browser: string | null;
  operatingSystem: string | null;
};

export type SessionMeta = {
  userAgent?: string | null;
  ipAddress?: string | null;
};
