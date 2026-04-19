"use client";

import React, { Component } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, PackageSearch, Download } from 'lucide-react';
import { StockService } from '@/services/inventory/stock.service';
import { ProductService } from '@/services/inventory/product.service';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface WarehouseStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: any | null; // Receive the warehouse object
}

interface StockItemDisplay {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
}

interface WarehouseStockModalState {
  stockItems: StockItemDisplay[];
  isLoading: boolean;
  error: string | null;
  isExporting?: boolean;
}

export class WarehouseStockModal extends Component<WarehouseStockModalProps, WarehouseStockModalState> {
  constructor(props: WarehouseStockModalProps) {
    super(props);
    this.state = {
      stockItems: [],
      isLoading: false,
      error: null
    };
  }

  componentDidMount() {
    if (this.props.isOpen && this.props.warehouse) {
      this.loadStock();
    }
  }

  componentDidUpdate(prevProps: WarehouseStockModalProps) {
    if (this.props.isOpen && !prevProps.isOpen && this.props.warehouse) {
      this.loadStock();
    }
  }

  loadStock = async () => {
    this.setState({ isLoading: true, error: null, stockItems: [] });
    try {
      const warehouseId = this.props.warehouse.id;
      // Fetch stock array for this warehouse
      const stockData = await StockService.getStock({ warehouseId });
      
      // Fetch all products so we can map names/SKUs quickly
      const allProducts = await ProductService.getAllProducts();
      const productMap = new Map((allProducts.items || []).map(p => [p.id, p]));

      const itemsToDisplay: StockItemDisplay[] = stockData.map(item => {
        const product = productMap.get(item.productId);
        return {
          productId: item.productId,
          name: product?.name || 'Sản phẩm không xác định',
          sku: product?.sku || 'N/A',
          unit: product?.unit || '-',
          quantity: item.quantity
        };
      });

      // Lọc ra các sản phẩm có số lượng > 0 (Hoặc giữ nguyên tuỳ ý, ở đây tôi muốn hiện tất cả những gì có trong bảng Stock)
      this.setState({ stockItems: itemsToDisplay, isLoading: false });
    } catch (error: any) {
      console.error('Lỗi khi tải tồn kho:', error);
      this.setState({ 
        error: error.response?.data?.message || error.message || 'Không thể tải chi tiết tồn kho.',
        isLoading: false 
      });
    }
  };

  handleExport = async () => {
    this.setState({ isExporting: true } as any);
    try {
      const warehouseId = this.props.warehouse.id;
      let url = '/stock/export';
      if (warehouseId) {
        url += `?warehouseId=${warehouseId}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ton-kho-${this.props.warehouse.name}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Xuất file thành công');
    } catch (e: any) {
      toast.error('Có lỗi xảy ra khi xuất file');
    } finally {
      this.setState({ isExporting: false } as any);
    }
  };

  render() {
    const { isOpen, onClose, warehouse } = this.props;
    const { stockItems, isLoading, error } = this.state;

    const modalVariants: Variants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.5, bounce: 0.4 } },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };
    
    const backdropVariants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    };

    if (!warehouse) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-auto z-10 my-8 overflow-hidden flex flex-col max-h-[90vh]"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 text-blue-600 dark:text-blue-400">
                      <PackageSearch size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Chi tiết tồn kho
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Kho: {warehouse.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={this.handleExport}
                      disabled={this.state.isExporting}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                    >
                      <Download size={16} /> {this.state.isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                    </button>
                    <motion.button
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                    >
                      <X size={24} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-start">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </div>
                  )}

                  {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu tồn kho...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Mã SKU
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Số lượng tồn
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Đơn vị
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                          {stockItems.length > 0 ? stockItems.map((item, index) => (
                            <motion.tr
                              key={item.productId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-800 dark:text-white">
                                  {item.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.sku}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className={`font-semibold ${item.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                  {item.quantity.toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.unit}
                                </div>
                              </td>
                            </motion.tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                <PackageSearch size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-base">Kho hiện tại chưa có sản phẩm nào.</p>
                                <p className="text-sm mt-1">Hãy chuyển hàng (Stock In) để cập nhật tồn kho.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                  <motion.button
                    type="button"
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                  >
                    Đóng
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
