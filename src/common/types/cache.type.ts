import type { Request } from 'express';

export type CacheableOptions = {
  ttl?: number;
  key?: string | ((req: Request) => string);
  scope?: 'global' | 'user';
};

export type InvalidateCacheOptions = {
  keys?: string[] | ((req: Request) => string[]);
  invalidateUser?: boolean;
};
