import { SetMetadata } from '@nestjs/common';
import { CacheableOptions } from 'src/common/types';

export type { CacheableOptions };

export const CACHEABLE_KEY = 'CACHEABLE_KEY';
export const Cacheable = (options: CacheableOptions = {}) =>
  SetMetadata(CACHEABLE_KEY, options);
