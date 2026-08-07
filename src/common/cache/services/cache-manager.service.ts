import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { CACHE_KEYS } from '../cache-tags';

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);
  private readonly DEFAULT_TTL_SECONDS = 300;

  constructor(private readonly redisService: RedisService) {}

  getUserEntityKey(userId: string): string {
    return CACHE_KEYS.userEntity(userId);
  }

  getUserProfileKey(userId: string): string {
    return CACHE_KEYS.userProfile(userId);
  }

  getUserProfileApiKey(userId: string): string {
    return CACHE_KEYS.userProfileApi(userId);
  }

  getUserDetailKey(userId: string): string {
    return CACHE_KEYS.userDetail(userId);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to read Redis cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return null;
  }

  async set(
    key: string,
    data: unknown,
    ttlSeconds = this.DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    try {
      await this.redisService.set(key, JSON.stringify(data), ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `Failed to write Redis cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
    } catch (error) {
      this.logger.warn(
        `Failed to delete Redis cache key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.del(CACHE_KEYS.userEntity(userId)),
      this.del(CACHE_KEYS.userProfile(userId)),
      this.del(CACHE_KEYS.userProfileApi(userId)),
      this.del(CACHE_KEYS.userDetail(userId)),
    ]);
  }

  async invalidateUsersCollection(): Promise<void> {
    await this.del(CACHE_KEYS.usersCollection);
  }
}
