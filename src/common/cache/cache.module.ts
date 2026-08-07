import { Global, Module } from '@nestjs/common';
import { RedisModule } from 'src/common/redis/redis.module';
import { CacheManagerService } from './services/cache-manager.service';
import { RedisCacheInterceptor } from './interceptors/redis-cache.interceptor';

@Global()
@Module({
  imports: [RedisModule],
  providers: [CacheManagerService, RedisCacheInterceptor],
  exports: [CacheManagerService, RedisCacheInterceptor],
})
export class AppCacheModule {}
