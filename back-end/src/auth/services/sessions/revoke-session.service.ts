import { Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import { RefreshSessionsRepository } from 'src/users/repositories/refresh-sessions.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { AuthzVersionService } from 'src/common/redis/authz-version.service';
import { TokensService } from 'src/tokens/tokens.service';
import { db } from 'src/db';

@Injectable()
export class RevokeSessionService {
  constructor(
    private readonly refreshSessionsRepository: RefreshSessionsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly authzVersionService: AuthzVersionService,
    private readonly tokensService: TokensService,
  ) {}

  async revokeSession(
    userId: string,
    sessionId: string,
    res: Response,
    refreshToken?: string,
  ) {
    const { session, newVersion } = await db.transaction(async (tx) => {
      const session = await this.refreshSessionsRepository.revokeSessionForUser(
        sessionId,
        userId,
        tx,
      );

      if (!session) {
        throw new NotFoundException(AUTH_MESSAGES.SESSION_NOT_FOUND);
      }

      const newVersion = await this.usersRepository.incrementAuthzVersion(
        userId,
        tx,
      );

      return { session, newVersion };
    });

    await this.authzVersionService.setVersion(userId, newVersion);

    const currentSessionId =
      await this.tokensService.getSessionIdFromRefreshToken(
        refreshToken,
        userId,
      );

    if (currentSessionId === session.id) {
      this.tokensService.clearRefreshTokenCookie(res);
    }

    return { message: AUTH_MESSAGES.SESSION_REVOKED_SUCCESS };
  }
}
