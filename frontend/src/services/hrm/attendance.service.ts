import api from '@/lib/axios';
import { ApiResponse } from '@/types/common/api';
import { Attendance } from '@/types/hrm/attendance';
export type { Attendance };



export const attendanceService = {
    async checkIn(): Promise<Attendance> {
        try {
            const response = await api.post<ApiResponse<Attendance>>(`/attendance/check-in`, {});
            return response.data.data;
        } catch (error: any) {
            throw error;
        }
    },

    async checkOut(): Promise<Attendance> {
        const response = await api.post<ApiResponse<Attendance>>(`/attendance/check-out`, {});
        return response.data.data;
    },

    async registerLeave(date: string, reason: string): Promise<Attendance> {
        const response = await api.post<ApiResponse<Attendance>>(`/attendance/leave`, { date, reason });
        return response.data.data;
    },

    async getMyToday(): Promise<Attendance | null> {
        try {
             // Backend: /attendance/me/today
             const response = await api.get<ApiResponse<Attendance>>(`/attendance/me/today`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    },

    async getMyHistory(month?: number, year?: number): Promise<Attendance[]> {
        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;

        // Backend: /attendance/me (or users/:id for admin, strictly this is 'getMyHistory' so 'me' is correct)
        const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/me`, {
            params
        });
        return response.data.data;
    },

    async update(id: string, data: Partial<Attendance>) {
        const response = await api.put<ApiResponse<Attendance>>(`/attendance/${id}`, data);
        return response.data.data;
    },

    // Admin: Get User History
    async getUserHistory(userId: string, month?: number, year?: number): Promise<Attendance[]> {
        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/users/${userId}`, {
            params
        });
        return response.data.data;
    }
};
