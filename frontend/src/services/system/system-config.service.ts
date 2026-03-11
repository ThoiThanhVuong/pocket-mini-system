import api from '@/lib/axios';

export interface SystemConfig {
    key: string;
    value: string;
    description?: string;
}

export const systemConfigService = {
    async getConfig(key: string): Promise<string> {
        const response = await api.get(`/system/config?key=${key}`);
        return response.data;
    },

    async getConfigs(keys: string[]): Promise<Record<string, string>> {
        const response = await api.get(`/system/config/group?keys=${keys.join(',')}`);
        return response.data; // Assuming backend returns object { key: value }
    },

    async updateConfig(key: string, value: string, description?: string): Promise<SystemConfig> {
        const response = await api.put(`/system/config`, { key, value, description });
        return response.data;
    }
};
