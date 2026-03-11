"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Search, Info, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { PaymentService } from '@/services/finance/payment.service';
import { Payment } from '@/types/finance/payment';

interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  filterType: string;
  filterStatus: string;
  searchQuery: string;
  showCreateModal?: boolean;
  createType?: string;
  createAmount?: string;
  createMethod?: string;
  createDescription?: string;
  isSubmitting?: boolean;
}

export default class PaymentsPage extends Component<{}, PaymentsState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      payments: [],
      loading: true,
      filterType: 'ALL',
      filterStatus: 'ALL',
      searchQuery: ''
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    this.setState({ loading: true });
    try {
      // payment.service might return wrapped ApiResponse depending on latest modifications, 
      // but let's safely fetch directly if it fails
      const res = await api.get('/payments');
      const data = res.data.data || res.data;
      this.setState({ payments: data || [] });
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  openCreateModal = (type: string) => {
    this.setState({
      showCreateModal: true,
      createType: type,
      createAmount: '',
      createMethod: 'cash',
      createDescription: ''
    } as any);
  };

  submitManualPayment = async () => {
    const { createType, createAmount, createMethod, createDescription } = this.state as any;
    if (!createAmount || Number(createAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ'); // Keep this as it is local validation before API call
      return;
    }
    this.setState({ isSubmitting: true } as any);
    try {
      await PaymentService.createManualPayment({
        type: createType || 'manual_income',
        amount: Number(createAmount),
        method: createMethod || 'cash',
        paymentDescription: createDescription || ''
      });
      toast.success('Tạo phiếu thu/chi thành công');
      this.setState({ showCreateModal: false, isSubmitting: false } as any);
      this.loadData();
    } catch (error: any) {
      // toast now handled globally in axios.ts
      this.setState({ isSubmitting: false } as any);
    }
  };

  render() {
    const { payments, loading, filterType, filterStatus, searchQuery } = this.state;

    const filteredPayments = payments.filter((p: any) => {
      if (filterType !== 'ALL' && p.referenceType !== filterType) return false;
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
      if (searchQuery && !p.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) && !p.id?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const statusColor: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'refunded': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };

    const typeLabel: Record<string, string> = {
      'stock_in': 'Chi tiền (Nhập kho)',
      'stock_out': 'Thu tiền (Xuất kho)',
      'manual_income': 'Thu tiền ngoài',
      'manual_expense': 'Chi tiền ngoài'
    };

    const typeColor: Record<string, string> = {
      'stock_in': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      'stock_out': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      'manual_income': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      'manual_expense': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    };

    return (
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý dòng tiền</h1>
          <p className="text-gray-500 dark:text-gray-400">Theo dõi các khoản thu / chi từ kho</p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm mã thanh toán / mã phiếu..."
                  value={searchQuery}
                  onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  className="w-64 pl-9 pr-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => this.setState({ filterType: e.target.value })}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả loại hình</option>
                <option value="stock_in">Chi tiền (Mua hàng)</option>
                <option value="stock_out">Thu tiền (Bán hàng)</option>
                <option value="manual_income">Thu tiền ngoài</option>
                <option value="manual_expense">Chi tiền ngoài</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => this.setState({ filterStatus: e.target.value })}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2 border-r border-gray-300 dark:border-gray-600 pr-4">
                Tổng số: {filteredPayments.length} giao dịch
              </div>
              <button onClick={() => this.openCreateModal('manual_income')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md flex items-center gap-1 transition-colors">
                <Plus size={16} /> Thu tiền
              </button>
              <button onClick={() => this.openCreateModal('manual_expense')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-md flex items-center gap-1 transition-colors">
                <Plus size={16} /> Chi tiền
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã GD</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã Phiếu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hình thức</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày GD</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Info className="h-10 w-10 mb-2 opacity-50" />
                          <p>Không tìm thấy giao dịch nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {p.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {p.referenceId?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor[p.referenceType] || 'bg-gray-100 text-gray-800'}`}>
                            {typeLabel[p.referenceType] || p.referenceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {Number(p.amount).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {p.method || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor[p.status] || 'bg-gray-100 text-gray-800'}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Manual Payment Modal */}
        {(this.state as any).showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 shadow-xl z-50 my-8 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {(this.state as any).createType === 'manual_income' ? 'Tạo phiếu thu ngoài' : 'Tạo phiếu chi ngoài'}
                </h3>
                <button onClick={() => this.setState({ showCreateModal: false } as any)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Số tiền (VNĐ) *</label>
                  <input type="number" value={(this.state as any).createAmount} onChange={e => this.setState({ createAmount: e.target.value } as any)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Ví dụ: 500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phương thức *</label>
                  <select value={(this.state as any).createMethod} onChange={e => this.setState({ createMethod: e.target.value } as any)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <option value="cash">Tiền mặt</option>
                    <option value="bank">Chuyển khoản</option>
                    <option value="credit">Thẻ tín dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lý do / Nội dung</label>
                  <textarea value={(this.state as any).createDescription} onChange={e => this.setState({ createDescription: e.target.value } as any)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none transition-colors" placeholder="Nhập lý do thu/chi cụ thể..." />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl">
                <button onClick={() => this.setState({ showCreateModal: false } as any)} className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors" disabled={(this.state as any).isSubmitting}>Hủy</button>
                <button onClick={this.submitManualPayment} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors w-32 flex justify-center" disabled={(this.state as any).isSubmitting}>{(this.state as any).isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}</button>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => !((this.state as any).isSubmitting) && this.setState({ showCreateModal: false } as any)}></div>
          </div>
        )}
      </div>
    );
  }
}
