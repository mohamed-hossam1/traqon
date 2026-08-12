import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import type { AuthUser } from 'src/common/types/auth-user.type';
import { db } from 'src/db';
import { ChangeRoleDto } from '../../dtos/change-role.dto';
import { UsersRepository } from '../../repositories/users.repository';
import { AdminAuditLogRepository } from '../../repositories/admin-audit-log.repository';
import { toPublicUser } from '../../utils/users.mapper';
import { AuthzVersionService } from 'src/common/redis/authz-version.service';

@Injectable()
export class ChangeRoleService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly adminAuditLogRepository: AdminAuditLogRepository,
    private readonly authzVersionService: AuthzVersionService,
  ) {}

  async changeRole(
    currentUser: AuthUser,
    targetUserId: string,
    dto: ChangeRoleDto,
  ) {
    if (currentUser.id === targetUserId) {
      throw new BadRequestException(AUTH_MESSAGES.CANNOT_CHANGE_OWN_ROLE);
    }

    const existingUser = await this.usersRepository.findById(targetUserId);
    if (!existingUser) {
      throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (existingUser.role === dto.role) {
      const ban = await this.usersRepository.findBanByUserId(targetUserId);
      const banHistory =
        await this.usersRepository.findBanHistoryByUserId(targetUserId);
      return {
        message: AUTH_MESSAGES.ROLE_CHANGED_SUCCESS,
        user: toPublicUser(existingUser, ban, banHistory),
      };
    }

    const { user, ban, banHistory, newVersion } = await db.transaction(
      async (tx) => {
        const updatedUser = await this.usersRepository.update(
          targetUserId,
          { role: dto.role },
          tx,
        );

        if (!updatedUser) {
          throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
        }

        const newVersion = await this.usersRepository.incrementAuthzVersion(
          targetUserId,
          tx,
        );

        await this.adminAuditLogRepository.create(
          {
            adminId: currentUser.id,
            adminSessionId: currentUser.sessionId,
            action: 'change_role',
            targetUserId,
            details: JSON.stringify({
              oldRole: existingUser.role,
              newRole: dto.role,
            }),
          },
          tx,
        );

        const ban = await this.usersRepository.findBanByUserId(
          targetUserId,
          tx,
        );
        const banHistory = await this.usersRepository.findBanHistoryByUserId(
          targetUserId,
          tx,
        );

        return { user: updatedUser, ban, banHistory, newVersion };
      },
    );

    await this.authzVersionService.setVersion(targetUserId, newVersion);

    return {
      message: AUTH_MESSAGES.ROLE_CHANGED_SUCCESS,
      user: toPublicUser(user, ban, banHistory),
    };
  }
}
