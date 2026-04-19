import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Loader2, Package, Calendar, Tag, DollarSign, Clock } from 'lucide-react';
import { Customer } from '@/types/partners/customer';
import { CustomerService } from '@/services/partners/customer.service';
import { toast } from 'sonner';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
        case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
        case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
};

const getStatusLabel = (status: string) => {
    switch(status) {
        case 'completed': return 'Đã giao hàng';
        case 'approved': return 'Đang giao';
        case 'cancelled': return 'Đã hủy';
        case 'pending': return 'Chờ duyệt';
        default: return status;
    }
};

export function CustomerHistoryModal({ isOpen, onClose, customer }: CustomerHistoryModalProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && customer) {
            loadHistory();
        } else {
            setHistory([]);
        }
    }, [isOpen, customer]);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await CustomerService.getCustomerHistory(customer!.id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
            toast.error('Không thể tải lịch sử mua hàng, vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', duration: 0.5, bounce: 0.3 } },
        exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
    };
    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl z-10 flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Lịch sử mua hàng</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Khách hàng: <span className="font-medium text-gray-700 dark:text-gray-300">{customer?.name}</span></p>
                            </div>
                            <motion.button
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/30">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải dữ liệu...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có giao dịch</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                        Khách hàng này hiện chưa phát sinh bất kỳ đơn hàng nào trên hệ thống.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((order, idx) => (
                                        <motion.div 
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                        <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                                                {order.referenceCode}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClass(order.status)}`}>
                                                                {getStatusLabel(order.status)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tổng tiền</p>
                                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                                                        {fmtCurrency(order.totalAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                                        <tr>
                                                            <th className="text-left font-medium pb-2 min-w-[200px]">Sản phẩm</th>
                                                            <th className="text-right font-medium pb-2 w-24">Số lượng</th>
                                                            <th className="text-right font-medium pb-2 w-32">Đơn giá</th>
                                                            <th className="text-right font-medium pb-2 w-32">Thành tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                        {order.items?.map((item: any) => (
                                                            <tr key={item.id} className="text-gray-700 dark:text-gray-300">
                                                                <td className="py-2.5 font-medium">{item.productName || item.productId}</td>
                                                                <td className="py-2.5 text-right">{item.quantity}</td>
                                                                <td className="py-2.5 text-right">{fmtCurrency(item.price)}</td>
                                                                <td className="py-2.5 text-right font-medium text-gray-900 dark:text-white">
                                                                    {fmtCurrency(item.quantity * item.price)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
