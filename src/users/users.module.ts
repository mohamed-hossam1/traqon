import { Module } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokensModule } from 'src/tokens/tokens.module';
import { UsersRepositoriesModule } from './users-repositories.module';
import { UsersController } from './users.controller';
import {
  UserProfileCacheService,
  DeleteUserService,
  DeleteMeService,
  UpdateUserService,
  UpdateMeService,
  BanUserService,
  UnbanUserService,
  ListUsersService,
  GetUserService,
  AdminListUserSessionsService,
  AdminRevokeSessionService,
} from './services';

@Module({
  imports: [UsersRepositoriesModule, TokensModule],
  controllers: [UsersController],
  providers: [
    UserProfileCacheService,
    DeleteUserService,
    DeleteMeService,
    UpdateUserService,
    UpdateMeService,
    BanUserService,
    UnbanUserService,
    ListUsersService,
    GetUserService,
    AdminListUserSessionsService,
    AdminRevokeSessionService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [UsersRepositoriesModule, UserProfileCacheService],
})
export class UsersModule {}
