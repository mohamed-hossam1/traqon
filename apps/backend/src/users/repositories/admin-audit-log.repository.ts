import { Injectable } from '@nestjs/common';
import { db, type DbTransaction } from 'src/db';
import {
  adminAuditLogs,
  users,
  type NewAdminAuditLog,
  type AdminAuditLog,
} from 'src/db/schema';
import { type SQL, and, desc, eq, count } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { ListAuditLogsQueryDto } from '../dtos/list-audit-logs-query.dto';

type DbExecutor = typeof db | DbTransaction;

export type DetailedAdminAuditLog = AdminAuditLog & {
  adminName: string | null;
  adminEmail: string | null;
  targetUserName: string | null;
  targetUserEmail: string | null;
};

@Injectable()
export class AdminAuditLogRepository {
  async create(
    data: NewAdminAuditLog,
    executor: DbExecutor = db,
  ): Promise<AdminAuditLog> {
    const [log] = await executor
      .insert(adminAuditLogs)
      .values(data)
      .returning();
    return log;
  }

  async findAllPaginated(
    dto: ListAuditLogsQueryDto,
    executor: DbExecutor = db,
  ): Promise<{
    data: DetailedAdminAuditLog[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const adminUser = alias(users, 'admin_user');
    const targetUser = alias(users, 'target_user');

    const conditions: SQL[] = [];
    if (dto.action) {
      conditions.push(eq(adminAuditLogs.action, dto.action));
    }
    if (dto.adminId) {
      conditions.push(eq(adminAuditLogs.adminId, dto.adminId));
    }
    if (dto.targetUserId) {
      conditions.push(eq(adminAuditLogs.targetUserId, dto.targetUserId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRow] = await executor
      .select({ count: count() })
      .from(adminAuditLogs)
      .where(whereClause);

    const totalItems = Number(totalRow?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const rows = await executor
      .select({
        id: adminAuditLogs.id,
        adminId: adminAuditLogs.adminId,
        adminSessionId: adminAuditLogs.adminSessionId,
        action: adminAuditLogs.action,
        targetUserId: adminAuditLogs.targetUserId,
        details: adminAuditLogs.details,
        createdAt: adminAuditLogs.createdAt,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
      })
      .from(adminAuditLogs)
      .leftJoin(adminUser, eq(adminAuditLogs.adminId, adminUser.id))
      .leftJoin(targetUser, eq(adminAuditLogs.targetUserId, targetUser.id))
      .where(whereClause)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: rows,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }
}
