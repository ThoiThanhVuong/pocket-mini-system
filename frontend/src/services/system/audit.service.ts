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
    getAllHistory: async (page = 1, limit = 12, search = ''): Promise<{ data: AuditLogItem[], total: number }> => {
        const res = await api.get(`/audit-logs?page=${page}&limit=${limit}&search=${search}`);
        return res.data.data;
    }
};
