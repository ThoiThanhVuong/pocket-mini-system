import { AuditLog } from '../../../../infrastructure/database/entities/system/auditLog.entity';

export const IAuditLogRepositoryKey = 'IAuditLogRepository';

export interface IAuditLogRepository {
    save(auditLog: Partial<AuditLog>): Promise<AuditLog>;
    findAll(options: { 
        entityType?: string; 
        entityId?: string; 
        page?: number; 
        limit?: number;
        search?: string;
    }): Promise<{ data: AuditLog[]; total: number }>;
    findByUser(userId: string): Promise<AuditLog[]>;
}
