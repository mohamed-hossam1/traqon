import { Injectable } from '@nestjs/common';
import { ListAuditLogsQueryDto } from '../../dtos/list-audit-logs-query.dto';
import { AdminAuditLogRepository } from '../../repositories/admin-audit-log.repository';

@Injectable()
export class ListAuditLogsService {
  constructor(
    private readonly adminAuditLogRepository: AdminAuditLogRepository,
  ) {}

  async list(dto: ListAuditLogsQueryDto) {
    return this.adminAuditLogRepository.findAllPaginated(dto);
  }
}
