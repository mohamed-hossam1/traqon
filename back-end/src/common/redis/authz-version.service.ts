import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class AuthzVersionService {
  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `authz:version:${userId}`;
  }

  async getVersion(userId: string): Promise<number | null> {
    const val = await this.redisService.get(this.getKey(userId));
    if (val === null || val === undefined) {
      return null;
    }
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }

  async setVersion(userId: string, version: number): Promise<void> {
    await this.redisService.set(this.getKey(userId), version.toString());
  }

  async deleteVersion(userId: string): Promise<void> {
    await this.redisService.del(this.getKey(userId));
  }
}
