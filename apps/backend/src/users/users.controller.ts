import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { AuthUser } from 'src/common/types/auth-user.type';
import {
  BanUserDto,
  UpdateUserDto,
  ListUsersQueryDto,
  ChangeRoleDto,
  ListAuditLogsQueryDto,
} from './dtos';
import { ROLES } from 'src/db/schema';
import { UsersRepository } from './repositories/users.repository';
import {
  DeleteUserService,
  DeleteMeService,
  UpdateUserService,
  UpdateMeService,
  BanUserService,
  UnbanUserService,
  ChangeRoleService,
  ListUsersService,
  GetUserService,
  AdminListUserSessionsService,
  AdminRevokeSessionService,
  ListAuditLogsService,
} from './services';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly deleteUserService: DeleteUserService,
    private readonly deleteMeService: DeleteMeService,
    private readonly updateUserService: UpdateUserService,
    private readonly updateMeService: UpdateMeService,
    private readonly banUserService: BanUserService,
    private readonly unbanUserService: UnbanUserService,
    private readonly changeRoleService: ChangeRoleService,
    private readonly listUsersService: ListUsersService,
    private readonly getUserService: GetUserService,
    private readonly adminListUserSessionsService: AdminListUserSessionsService,
    private readonly adminRevokeSessionService: AdminRevokeSessionService,
    private readonly listAuditLogsService: ListAuditLogsService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all users (admin)',
    description:
      'Admin-only. Returns paginated list of users with search, filter, and sort.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'banned'] })
  @ApiQuery({ name: 'role', required: false, enum: ['user', 'admin'] })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'name', 'email'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.listUsersService.list(query);
  }

  @Get('audit-logs')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List admin audit logs (admin)',
    description:
      'Admin-only. Returns paginated list of admin audit logs with filters.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'adminId', required: false, type: String })
  @ApiQuery({ name: 'targetUserId', required: false, type: String })
  listAuditLogs(@Query() query: ListAuditLogsQueryDto) {
    return this.listAuditLogsService.list(query);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async me(@User() user: AuthUser) {
    const currentUser = await this.usersRepository.findById(user.id);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: currentUser.id,
        sessionId: user.sessionId,
        email: currentUser.email,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
        isVerified: currentUser.isVerified,
        isBanned: currentUser.isBanned,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt,
        hasPassword: Boolean(currentUser.passwordHash),
        ban: null,
      },
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user details (admin)',
    description: 'Admin-only. Returns detailed user info with ban data.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the user', format: 'uuid' })
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUserService.getUser(id);
  }

  @Get(':id/sessions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List user sessions (admin)',
    description:
      'Admin-only. Returns all sessions (active, revoked, expired) for a user.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the user', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listUserSessions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminListUserSessionsService.listSessions(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post(':id/sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revoke a user session (admin)',
    description: 'Admin-only. Revokes a specific session for a user.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the user', format: 'uuid' })
  @ApiParam({
    name: 'sessionId',
    description: 'UUID of the session to revoke',
    format: 'uuid',
  })
  revokeSession(
    @User() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return this.adminRevokeSessionService.revoke(user, id, sessionId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Authenticated users can update their own name and avatarUrl only.',
  })
  updateMe(@User() user: AuthUser, @Body() updateUserDto: UpdateUserDto) {
    return this.updateMeService.updateMe(user, updateUserDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a user profile',
    description: 'Admin-only. Updates any user profile.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user to update',
    format: 'uuid',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.updateUserService.update(id, updateUserDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Delete current user account',
    description:
      'Authenticated users can delete their own account. Clears the refresh cookie.',
  })
  deleteMe(@User() user: AuthUser, @Res({ passthrough: true }) res: Response) {
    return this.deleteMeService.deleteMe(user, res);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Admin-only. Deletes any user.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user to delete',
    format: 'uuid',
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUserService.delete(id);
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ban a user',
    description:
      'Admin-only. Creates a row in user_bans, sets isBanned, and revokes all of the user sessions.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user to ban',
    format: 'uuid',
  })
  ban(
    @User() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() banUserDto: BanUserDto,
  ) {
    return this.banUserService.ban(user, id, banUserDto);
  }

  @Post(':id/unban')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unban a user',
    description:
      'Admin-only. Deletes the user_bans row and clears the isBanned flag.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user to unban',
    format: 'uuid',
  })
  unban(@User() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.unbanUserService.unban(user, id);
  }

  @Post(':id/role')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change user role (admin)',
    description:
      'Admin-only. Updates user role and invalidates existing Access JWTs via authz_version.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user whose role is being changed',
    format: 'uuid',
  })
  changeRole(
    @User() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    return this.changeRoleService.changeRole(user, id, changeRoleDto);
  }
}
