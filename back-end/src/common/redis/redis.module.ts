import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AuthzVersionService } from './authz-version.service';

@Global()
@Module({
  providers: [RedisService, AuthzVersionService],
  exports: [RedisService, AuthzVersionService],
})
export class RedisModule {}
