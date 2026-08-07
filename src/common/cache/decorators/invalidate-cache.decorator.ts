import { SetMetadata } from '@nestjs/common';
import { InvalidateCacheOptions } from 'src/common/types';

export type { InvalidateCacheOptions };

export const INVALIDATE_CACHE_KEY = 'INVALIDATE_CACHE_KEY';
export const InvalidateCache = (options: InvalidateCacheOptions = {}) =>
  SetMetadata(INVALIDATE_CACHE_KEY, options);
