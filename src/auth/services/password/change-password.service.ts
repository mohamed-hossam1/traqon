import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import { db } from 'src/db';
import { HashingService } from 'src/hashing/hashing.service';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { RefreshSessionsRepository } from 'src/users/repositories/refresh-sessions.repository';
import { ChangePasswordDto } from '../../dtos/change-password.dto';
import { AuthUser } from 'src/common/types/auth-user.type';
import { AuthzVersionService } from 'src/common/redis/authz-version.service';

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshSessionsRepository: RefreshSessionsRepository,
    private readonly hashingService: HashingService,
    private readonly authzVersionService: AuthzVersionService,
  ) {}

  async changePassword(user: AuthUser, changePasswordDto: ChangePasswordDto) {
    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new ConflictException(
        AUTH_MESSAGES.CURRENT_PASSWORD_AND_NEW_PASSWORD_ARE_THE_SAME,
      );
    }

    const existingUser = await this.usersRepository.findById(user.id);

    if (!existingUser) {
      throw new UnauthorizedException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (!existingUser.passwordHash) {
      throw new BadRequestException(AUTH_MESSAGES.PASSWORD_NOT_SET);
    }

    const passwordValid = await this.hashingService.compare(
      changePasswordDto.oldPassword,
      existingUser.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.CURRENT_PASSWORD_INVALID);
    }

    const passwordHash = await this.hashingService.hash(
      changePasswordDto.newPassword,
    );

    const currentSessionId = user.sessionId;

    const newVersion = await db.transaction(async (tx) => {
      await this.usersRepository.update(existingUser.id, { passwordHash }, tx);
      const newVersion = await this.usersRepository.incrementAuthzVersion(
        existingUser.id,
        tx,
      );

      if (changePasswordDto.revokeOtherSessions) {
        await this.refreshSessionsRepository.revokeAllExcept(
          existingUser.id,
          currentSessionId,
          tx,
        );
      }

      return newVersion;
    });

    await this.authzVersionService.setVersion(existingUser.id, newVersion);

    return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESS };
  }
}
