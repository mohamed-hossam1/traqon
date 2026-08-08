import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { RefreshSessionsRepository } from './repositories/refresh-sessions.repository';
import { AdminAuditLogRepository } from './repositories/admin-audit-log.repository';
import { AuthTokensRepository } from './repositories/auth-tokens.repository';
import { OauthAccountsRepository } from './repositories/oauth-accounts.repository';

@Module({
  providers: [
    UsersRepository,
    RefreshSessionsRepository,
    AdminAuditLogRepository,
    AuthTokensRepository,
    OauthAccountsRepository,
  ],
  exports: [
    UsersRepository,
    RefreshSessionsRepository,
    AdminAuditLogRepository,
    AuthTokensRepository,
    OauthAccountsRepository,
  ],
})
export class UsersRepositoriesModule {}
