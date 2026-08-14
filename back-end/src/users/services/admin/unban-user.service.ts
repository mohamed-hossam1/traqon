import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import type { AuthUser } from 'src/common/types/auth-user.type';
import { db } from 'src/db';
import { UsersRepository } from '../../repositories/users.repository';
import { AdminAuditLogRepository } from '../../repositories/admin-audit-log.repository';
import { toPublicUser } from '../../utils/users.mapper';
import { AuthzVersionService } from 'src/common/redis/authz-version.service';

@Injectable()
export class UnbanUserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly adminAuditLogRepository: AdminAuditLogRepository,
    private readonly authzVersionService: AuthzVersionService,
  ) {}

  async unban(currentUser: AuthUser, targetUserId: string) {
    const { user, banHistory, status, newVersion } = await db.transaction(
      async (tx) => {
        const result = await this.usersRepository.unbanUser(targetUserId, tx);

        let newVersion: number | undefined;
        if (result.status === 'SUCCESS') {
          newVersion = await this.usersRepository.incrementAuthzVersion(
            targetUserId,
            tx,
          );

          await this.adminAuditLogRepository.create(
            {
              adminId: currentUser.id,
              adminSessionId: currentUser.sessionId,
              action: 'unban_user',
              targetUserId,
              details: null,
            },
            tx,
          );
        }

        return { ...result, newVersion };
      },
    );

    if (status === 'NOT_FOUND') {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (status === 'NOT_BANNED') {
      throw new BadRequestException(AUTH_MESSAGES.USER_NOT_BANNED);
    }

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (newVersion !== undefined) {
      await this.authzVersionService.setVersion(targetUserId, newVersion);
    }

    return {
      message: AUTH_MESSAGES.USER_UNBANNED_SUCCESS,
      user: toPublicUser(user, null, banHistory),
    };
  }
}
