import api from '@/lib/axios';
import { Payment } from '@/types/finance/payment';
import { ApiResponse } from '@/types/common/api';

export const PaymentService = {
  async getAllPayments(): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>('/payments');
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  async getPaymentsByReference(refId: string): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>(`/payments/reference/${refId}`);
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  async processPayment(id: string, method: string): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>(`/payments/${id}/pay`, { method });
    return response.data.data || response.data;
  },

  async createManualPayment(data: { type: string, amount: number, method: string, paymentDescription: string }): Promise<any> {
    const response = await api.post('/payments', data);
    return response.data;
  }
};
