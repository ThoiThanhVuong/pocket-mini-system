import { Injectable, Inject } from '@nestjs/common';
import type { IAuditService } from '../../../core/interfaces/services/system/audit.service.interface';
import { IAuditLogRepositoryKey } from '../../../core/interfaces/repositories/system/audit-log.repository.interface';
import type { IAuditLogRepository } from '../../../core/interfaces/repositories/system/audit-log.repository.interface';

@Injectable()
export class AuditService implements IAuditService {
    constructor(
        @Inject(IAuditLogRepositoryKey)
        private readonly auditRepo: IAuditLogRepository,
    ) {}

    async log(
        entityType: string,
        entityId: string,
        action: string,
        userId: string,
        changes?: Record<string, any>
    ): Promise<void> {
        await this.auditRepo.save({
            entityType,
            entityId,
            action,
            user: { id: userId } as any,
            changes,
        });
    }

    async getHistory(entityType: string, entityId: string): Promise<any[]> {
        const result = await this.auditRepo.findAll({ entityType, entityId, limit: 1000 }); // History for specific entity usually doesn't need strict pagination or can have higher limit
        return result.data;
    }

    async getAllHistory(options: { page?: number; limit?: number; search?: string }): Promise<{ data: any[]; total: number }> {
        return this.auditRepo.findAll(options);
    }
}
