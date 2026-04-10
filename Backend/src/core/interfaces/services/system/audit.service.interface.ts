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
    getAllHistory(options: { page?: number; limit?: number; search?: string }): Promise<{ data: any[]; total: number }>;
}
