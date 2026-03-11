import { Injectable, Inject } from '@nestjs/common';
import type { IAuditService } from '../../core/interfaces/services/audit.service.interface';
import { IAuditLogRepositoryKey } from '../../core/interfaces/repositories/audit-log.repository.interface';
import type { IAuditLogRepository } from '../../core/interfaces/repositories/audit-log.repository.interface';

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
        return this.auditRepo.findAll(entityType, entityId);
    }

    async getAllHistory(limit: number = 100): Promise<any[]> {
        // We can extend repository to support limit if needed, but for now findAll is fine
        return this.auditRepo.findAll();
    }
}
