import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class UserProfileCacheService {
  private readonly logger = new Logger(UserProfileCacheService.name);
  private readonly TTL_SECONDS = 300; // 5 minutes profile cache

  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `cache:user:profile:${userId}`;
  }

  async get<T>(userId: string): Promise<T | null> {
    try {
      const cached = await this.redisService.get(this.getKey(userId));
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to read profile cache for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return null;
  }

  async set(userId: string, data: unknown): Promise<void> {
    try {
      await this.redisService.set(
        this.getKey(userId),
        JSON.stringify(data),
        this.TTL_SECONDS,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to write profile cache for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async invalidate(userId: string): Promise<void> {
    try {
      await this.redisService.del(this.getKey(userId));
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate profile cache for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
