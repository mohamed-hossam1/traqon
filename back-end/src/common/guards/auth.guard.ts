import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { AuthzVersionService } from 'src/common/redis/authz-version.service';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import {
  AuthUser,
  JwtPayload,
  OptionalAuthRequest as RequestWithUser,
} from 'src/common/types';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly authzVersionService: AuthzVersionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const accessToken = this.extractAccessToken(request);
    if (!accessToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    const user = await this.validateAccessToken(accessToken);
    request.user = user;
    return true;
  }

  private async validateAccessToken(token: string): Promise<AuthUser> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    if (!payload || !payload.userId || !payload.sessionId) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    const currentVersion = await this.getCurrentAuthzVersion(payload.userId);

    if (payload.av === undefined || payload.av !== currentVersion) {
      throw new UnauthorizedException({
        message: AUTH_MESSAGES.STALE_AUTHORIZATION,
        code: 'STALE_AUTHORIZATION',
      });
    }

    return {
      id: payload.userId,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }

  private async getCurrentAuthzVersion(userId: string): Promise<number> {
    let redisVersion: number | null = null;
    try {
      redisVersion = await this.authzVersionService.getVersion(userId);
    } catch (error) {
      this.logger.error(
        `Redis connection error during authz version check for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException({
        message: AUTH_MESSAGES.AUTHORIZATION_SERVICE_UNAVAILABLE,
        code: 'AUTHORIZATION_SERVICE_UNAVAILABLE',
      });
    }

    if (redisVersion !== null) {
      return redisVersion;
    }

    const dbVersion = await this.usersRepository.getAuthzVersion(userId);
    if (dbVersion === null) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    await this.authzVersionService
      .setVersion(userId, dbVersion)
      .catch((err) =>
        this.logger.warn(
          `Failed to backfill Redis authz version for ${userId}: ${err.message}`,
        ),
      );

    return dbVersion;
  }

  private extractAccessToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
