import { Module } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokensModule } from 'src/tokens/tokens.module';
import { UsersRepositoriesModule } from './users-repositories.module';
import { UsersController } from './users.controller';
import {
  DeleteUserService,
  DeleteMeService,
  UpdateUserService,
  UpdateMeService,
  BanUserService,
  UnbanUserService,
  ChangeRoleService,
  ListUsersService,
  GetUserService,
  AdminListUserSessionsService,
  AdminRevokeSessionService,
  ListAuditLogsService,
} from './services';

@Module({
  imports: [UsersRepositoriesModule, TokensModule],
  controllers: [UsersController],
  providers: [
    DeleteUserService,
    DeleteMeService,
    UpdateUserService,
    UpdateMeService,
    BanUserService,
    UnbanUserService,
    ChangeRoleService,
    ListUsersService,
    GetUserService,
    AdminListUserSessionsService,
    AdminRevokeSessionService,
    ListAuditLogsService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [UsersRepositoriesModule],
})
export class UsersModule {}
