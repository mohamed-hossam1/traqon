import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from '../common/guards/auth.guard';
import { HashingModule } from 'src/hashing/hashing.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { ConfigModule } from '@nestjs/config';
import {
  SignUpService,
  SignInService,
  VerifyEmailService,
  LogoutService,
  ListSessionsService,
  RevokeSessionService,
  RevokeAllOtherSessionsService,
  ForgotPasswordService,
  ResetPasswordService,
  ChangePasswordService,
  RefreshService,
  ResendVerificationEmailService,
  GoogleOauthLoginService,
  GoogleOauthCallbackService,
  SetPasswordService,
  ListOauthAccountsService,
  UnlinkOauthAccountService,
} from './services';

@Module({
  imports: [
    HashingModule,
    TokensModule,
    UsersModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    SignUpService,
    SignInService,
    VerifyEmailService,
    LogoutService,
    ListSessionsService,
    RevokeSessionService,
    RevokeAllOtherSessionsService,
    ForgotPasswordService,
    ResetPasswordService,
    ChangePasswordService,
    RefreshService,
    ResendVerificationEmailService,
    GoogleOauthLoginService,
    GoogleOauthCallbackService,
    SetPasswordService,
    ListOauthAccountsService,
    UnlinkOauthAccountService,
    AuthGuard,
  ],
})
export class AuthModule {}
