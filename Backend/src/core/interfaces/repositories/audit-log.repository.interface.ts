import { AuditLog } from '../../../infrastructure/database/entities/system/auditLog.entity';

export const IAuditLogRepositoryKey = 'IAuditLogRepository';

export interface IAuditLogRepository {
    save(auditLog: Partial<AuditLog>): Promise<AuditLog>;
    findAll(entityType?: string, entityId?: string): Promise<AuditLog[]>;
    findByUser(userId: string): Promise<AuditLog[]>;
}
