export const IAuditServiceKey = 'IAuditService';

export interface IAuditService {
    log(
        entityType: string,
        entityId: string,
        action: string,
        userId: string,
        changes?: Record<string, any>
    ): Promise<void>;
    
    getHistory(entityType: string, entityId: string): Promise<any[]>;
    getAllHistory(limit?: number): Promise<any[]>;
}
