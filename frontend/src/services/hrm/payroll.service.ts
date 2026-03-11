import api from '@/lib/axios';
import { ApiResponse } from '@/types/common/api';
import { Payroll } from '@/types/hrm/payroll';



export const payrollService = {
  // Admin: Calculate Monthly Salary for a user
  calculateSalary: async (userId: string, month: number, year: number) => {
    // Backend: POST /payroll/calculate/:userId
    const response = await api.post<ApiResponse<Payroll>>(`/payroll/calculate/${userId}`, {
      month, 
      year 
    });
    return response.data.data;
  },

  // Admin: Get list of payrolls for a specific month
  getMonthlyList: async (month: number, year: number) => {
    // Backend: GET /payroll/list
    const response = await api.get<ApiResponse<Payroll[]>>(`/payroll/list?month=${month}&year=${year}`);
    return response.data.data;
  },

  // User: Get my payroll
  getMyPayroll: async (month: number, year: number) => {
    // Backend: GET /payroll/me
    const response = await api.get<ApiResponse<Payroll | null>>(`/payroll/me?month=${month}&year=${year}`);
    return response.data.data;
  },
    async update(id: string, data: any) {
        const response = await api.put(`/payroll/${id}`, data);
        return response.data;
    }
};
