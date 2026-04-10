import { Controller, Get, Query, UseGuards, Inject, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IAuditService } from '../../../core/interfaces/services/system/audit.service.interface';
import { IAuditServiceKey } from '../../../core/interfaces/services/system/audit.service.interface';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditLogController {
    constructor(
        @Inject(IAuditServiceKey)
        private readonly auditService: IAuditService,
    ) {}

    @Get('history')
    async getHistory(
        @Query('entityType') entityType: string,
        @Query('entityId') entityId: string,
    ) {
        return this.auditService.getHistory(entityType, entityId);
    }

    @Get()
    async getAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '12',
        @Query('search') search?: string,
    ) {
        return this.auditService.getAllHistory({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
        });
    }
}
