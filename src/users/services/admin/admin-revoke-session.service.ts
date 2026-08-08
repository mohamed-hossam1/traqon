import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_MESSAGES } from 'src/common/constants/messages.constant';
import type { AuthUser } from 'src/common/types/auth-user.type';
import { TokensService } from 'src/tokens/tokens.service';
import { db } from 'src/db';
import { RefreshSessionsRepository } from '../../repositories/refresh-sessions.repository';
import { AdminAuditLogRepository } from '../../repositories/admin-audit-log.repository';

@Injectable()
export class AdminRevokeSessionService {
  constructor(
    private readonly refreshSessionsRepository: RefreshSessionsRepository,
    private readonly adminAuditLogRepository: AdminAuditLogRepository,
    private readonly tokensService: TokensService,
  ) {}

  async revoke(currentUser: AuthUser, userId: string, sessionId: string) {
    if (currentUser.sessionId === sessionId) {
      throw new BadRequestException(ADMIN_MESSAGES.CANNOT_REVOKE_OWN_SESSION);
    }

    const session = await this.refreshSessionsRepository.findById(sessionId);

    if (!session || session.userId !== userId) {
      throw new NotFoundException(ADMIN_MESSAGES.SESSION_NOT_FOUND);
    }

    if (session.revokedAt) {
      throw new BadRequestException(ADMIN_MESSAGES.SESSION_ALREADY_REVOKED);
    }

    await db.transaction(async (tx) => {
      await this.refreshSessionsRepository.revokeSessionForUser(
        sessionId,
        userId,
        tx,
      );

      await this.adminAuditLogRepository.create(
        {
          adminId: currentUser.id,
          adminSessionId: currentUser.sessionId ?? null,
          action: 'revoke_session',
          targetUserId: userId,
          details: JSON.stringify({ sessionId }),
        },
        tx,
      );
    });

    await this.tokensService.blacklistSession(sessionId);

    return { message: ADMIN_MESSAGES.SESSION_REVOKED };
  }
}
