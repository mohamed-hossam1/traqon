import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constant';
import { db } from 'src/db';
import { HashingService } from 'src/hashing/hashing.service';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { RefreshSessionsRepository } from 'src/users/repositories/refresh-sessions.repository';
import { SetPasswordDto } from '../../dtos/set-password.dto';
import { AuthUser } from 'src/common/types/auth-user.type';
import { AuthzVersionService } from 'src/common/redis/authz-version.service';

@Injectable()
export class SetPasswordService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshSessionsRepository: RefreshSessionsRepository,
    private readonly hashingService: HashingService,
    private readonly authzVersionService: AuthzVersionService,
  ) {}

  async setPassword(user: AuthUser, setPasswordDto: SetPasswordDto) {
    const existingUser = await this.usersRepository.findById(user.id);

    if (!existingUser) {
      throw new UnauthorizedException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (existingUser.passwordHash) {
      throw new ConflictException(AUTH_MESSAGES.PASSWORD_ALREADY_SET);
    }

    const passwordHash = await this.hashingService.hash(
      setPasswordDto.password,
    );

    const currentSessionId = user.sessionId;

    const newVersion = await db.transaction(async (tx) => {
      await this.usersRepository.update(existingUser.id, { passwordHash }, tx);
      const newVersion = await this.usersRepository.incrementAuthzVersion(
        existingUser.id,
        tx,
      );

      if (setPasswordDto.revokeOtherSessions) {
        await this.refreshSessionsRepository.revokeAllExcept(
          existingUser.id,
          currentSessionId,
          tx,
        );
      }

      return newVersion;
    });

    await this.authzVersionService.setVersion(existingUser.id, newVersion);

    return { message: AUTH_MESSAGES.SET_PASSWORD_SUCCESS };
  }
}
