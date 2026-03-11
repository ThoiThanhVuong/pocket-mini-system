import api from '@/lib/axios';

export interface AuditLogItem {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    changes: any;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
    };
}

export const AuditService = {
    getHistory: async (entityType: string, entityId: string): Promise<AuditLogItem[]> => {
        const res = await api.get(`/audit-logs/history?entityType=${entityType}&entityId=${entityId}`);
        return res.data.data;
    },
    getAllHistory: async (): Promise<AuditLogItem[]> => {
        const res = await api.get('/audit-logs');
        return res.data.data;
    }
};
