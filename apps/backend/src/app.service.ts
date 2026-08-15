import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { db } from './db';
import { RedisService } from './common/redis/redis.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly redisService: RedisService) {}

  async getHealth(): Promise<{
    status: 'ok' | 'degraded';
    timestamp: string;
    services: {
      database: 'connected' | 'disconnected';
      redis: 'connected' | 'disconnected';
    };
  }> {
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
    let redisStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      await db.execute(sql`SELECT 1`);
      databaseStatus = 'connected';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Database health check failed: ${msg}`);
    }

    try {
      const pingRes = await this.redisService.getClient().ping();
      if (pingRes === 'PONG') {
        redisStatus = 'connected';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Redis health check failed: ${msg}`);
    }

    const overallStatus =
      databaseStatus === 'connected' && redisStatus === 'connected'
        ? 'ok'
        : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
        redis: redisStatus,
      },
    };
  }
}
