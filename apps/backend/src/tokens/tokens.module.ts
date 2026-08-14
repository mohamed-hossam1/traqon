import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersRepositoriesModule } from 'src/users/users-repositories.module';
import { TokensService } from './tokens.service';

@Module({
  imports: [JwtModule, ConfigModule, UsersRepositoriesModule],
  providers: [TokensService],
  exports: [TokensService, JwtModule],
})
export class TokensModule {}
