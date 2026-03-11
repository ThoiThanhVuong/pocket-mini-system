import React, { Component } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { Payment } from '@/types/sales/payment';
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}
interface PaymentModalState {
  formData: {
    orderId: string;
    customerName: string;
    amount: number;
    method: string;
    reference: string;
    notes: string;
    status: string;
  };
}
export class PaymentModal extends Component<
  PaymentModalProps,
  PaymentModalState>
{
  constructor(props: PaymentModalProps) {
    super(props);
    this.state = {
      formData: {
        orderId: props.payment?.orderId || '',
        customerName: props.payment?.customerName || '',
        amount: props.payment?.amount || 0,
        method: props.payment?.method || 'Bank Transfer',
        reference: props.payment?.reference || '',
        notes: props.payment?.notes || '',
        status: props.payment?.status || 'Pending'
      }
    };
  }
  handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>

  {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: name === 'amount' ? Number(value) : value
      }
    }));
  };
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.onClose();
  };
  render() {
    const { isOpen, onClose, payment } = this.props;
    const { formData } = this.state;
    return (
      <AnimatePresence>
        {isOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} />

            <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.2
            }}>

              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {payment ? 'Chi tiết thanh toán' : 'Thêm thanh toán mới'}
                </h2>
                <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">

                  <X size={20} />
                </button>
              </div>

              <form onSubmit={this.handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mã đơn hàng
                    </label>
                    <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={this.handleChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Khách hàng
                    </label>
                    <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={this.handleChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required />

                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số tiền (VND)
                    </label>
                    <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={this.handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phương thức
                    </label>
                    <select
                    name="method"
                    value={formData.method}
                    onChange={this.handleChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                      <option value="Bank Transfer">Chuyển khoản</option>
                      <option value="Credit Card">Thẻ tín dụng</option>
                      <option value="E-Wallet">Ví điện tử</option>
                      <option value="Cash">Tiền mặt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã tham chiếu
                  </label>
                  <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={this.handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                  name="status"
                  value={formData.status}
                  onChange={this.handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                    <option value="Pending">Chờ xử lý</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Failed">Thất bại</option>
                    <option value="Refunded">Hoàn tiền</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={this.handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />

                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">

                    Hủy
                  </button>
                  <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">

                    {payment ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>);

  }
}