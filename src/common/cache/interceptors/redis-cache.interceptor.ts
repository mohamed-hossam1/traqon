import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CACHEABLE_KEY,
  CacheableOptions,
} from '../decorators/cacheable.decorator';
import {
  INVALIDATE_CACHE_KEY,
  InvalidateCacheOptions,
} from '../decorators/invalidate-cache.decorator';
import { CacheManagerService } from '../services/cache-manager.service';
import { getClientIp } from 'src/common/utils/request.util';
import { CACHE_KEYS } from '../cache-tags';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheManager: CacheManagerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const targetClass = context.getClass();

    const cacheableOptions = this.reflector.getAllAndOverride<CacheableOptions>(
      CACHEABLE_KEY,
      [handler, targetClass],
    );

    const invalidateOptions =
      this.reflector.getAllAndOverride<InvalidateCacheOptions>(
        INVALIDATE_CACHE_KEY,
        [handler, targetClass],
      );

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: any }>();

    let cacheKey: string | null = null;
    if (cacheableOptions && request.method === 'GET') {
      cacheKey = this.buildCacheKey(request, cacheableOptions);
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData !== null) {
        return of(cachedData);
      }
    }

    return next.handle().pipe(
      tap((responseBody) => {
        void (async () => {
          if (cacheKey && responseBody !== undefined) {
            const ttl = cacheableOptions?.ttl ?? 300;
            await this.cacheManager.set(cacheKey, responseBody, ttl);
          }

          if (invalidateOptions) {
            if (invalidateOptions.invalidateUser && request.user?.id) {
              await this.cacheManager.invalidateUser(request.user.id);
            }

            if (invalidateOptions.keys) {
              const keysToDelete =
                typeof invalidateOptions.keys === 'function'
                  ? invalidateOptions.keys(request)
                  : invalidateOptions.keys;

              for (const key of keysToDelete) {
                await this.cacheManager.del(key);
              }
            }
          }
        })();
      }),
    );
  }

  private buildCacheKey(req: any, options: CacheableOptions): string {
    if (options.key) {
      if (typeof options.key === 'function') {
        return options.key(req);
      }
      return options.key;
    }

    const userId = req.user?.id;
    const ip =
      getClientIp(req.headers?.['x-forwarded-for'], req.ip) ?? '127.0.0.1';
    const scopeIdentifier =
      options.scope === 'user' && userId ? `user:${userId}` : `ip:${ip}`;

    return CACHE_KEYS.endpoint(req.method, req.path, scopeIdentifier);
  }
}
