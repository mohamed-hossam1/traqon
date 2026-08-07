import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { TokensService } from 'src/tokens/tokens.service';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import {
  AuthUser,
  JwtPayload,
  OptionalAuthRequest as RequestWithUser,
  UserRole,
} from 'src/common/types';
import { assertUserNotBanned } from 'src/common/utils/ban.util';
import { CacheManagerService } from '../cache/services/cache-manager.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly tokensService: TokensService,
    private readonly cacheManager: CacheManagerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const accessToken = this.extractAccessToken(request);
    if (!accessToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    const user = await this.tryAccessToken(accessToken);
    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    request.user = user;
    return true;
  }

  private async tryAccessToken(token: string): Promise<AuthUser | null> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch {
      return null;
    }

    if (payload.sessionId) {
      await this.assertSessionNotBlacklisted(payload.sessionId);
    }

    if (!payload.userId) {
      return null;
    }

    const user = await this.getVerifiedUser(payload.userId);
    await this.assertNotBanned(user);

    return this.buildAuthUser(user, payload.sessionId);
  }

  private async assertSessionNotBlacklisted(sessionId: string): Promise<void> {
    const isBlacklisted =
      await this.tokensService.isSessionBlacklisted(sessionId);
    if (isBlacklisted) {
      throw new UnauthorizedException(AUTH_MESSAGES.TOKEN_REVOKED);
    }
  }

  private async getVerifiedUser(userId: string) {
    const cacheKey = this.cacheManager.getUserEntityKey(userId);
    const cachedUser = await this.cacheManager.get<any>(cacheKey);

    if (cachedUser) {
      if (!cachedUser.isVerified) {
        throw new UnauthorizedException(AUTH_MESSAGES.EMAIL_NOT_VERIFIED);
      }
      return cachedUser;
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(AUTH_MESSAGES.EMAIL_NOT_VERIFIED);
    }

    await this.cacheManager.set(cacheKey, user, 300);
    return user;
  }

  private async assertNotBanned(user: { id: string; isBanned: boolean }) {
    if (!user.isBanned) {
      return;
    }
    const ban = await this.usersRepository.findBanByUserId(user.id);
    assertUserNotBanned({ isBanned: true, banReason: ban?.banReason });
  }

  private buildAuthUser(
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
      role: UserRole;
      isVerified: boolean;
      isBanned: boolean;
    },
    sessionId?: string,
  ): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isVerified: user.isVerified,
      isBanned: user.isBanned,
      sessionId,
    };
  }

  private extractAccessToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
