import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Check, Search, ArrowRightLeft, Eye, X, ChevronDown, ChevronUp, Plus, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { NoteSection } from '@/components/system/NoteSection';
import { SlipPrintLayout } from '@/components/inventory/SlipPrintLayout';
import { WarehouseService } from '@/services/inventory/warehouse.service';
import { ProductService } from '@/services/inventory/product.service';
import { StockTransferService } from '@/services/inventory/stock-transfer.service';
import { StockService } from '@/services/inventory/stock.service';
import { CreateStockTransferDto, StockTransferState } from '@/types/inventory/stock-transfer';
import { useAuthStore } from '@/store/useAuthStore';

export class StockTransfer extends Component<{}, StockTransferState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentStep: 1,
      showSuccess: false,
      searchQuery: '',
      selectedProduct: null,
      fromWarehouse: '',
      toWarehouse: '',
      quantity: '',
      notes: '',
      warehouses: [],
      allWarehouses: [],
      products: [],
      transfers: [],
      availableStock: null,
      warehouseStock: [],
      isSubmitting: false,
      error: null
    };
  }

  componentDidMount() {
    this.loadInitialData();
  }

  loadTransfers = async () => {
    try {
      const { search, filterFromWarehouseId, filterToWarehouseId, currentPage } = this.state as any;
      const response = await StockTransferService.getAllStockTransfers({
        search,
        warehouseId: filterFromWarehouseId || filterToWarehouseId, // The API handles either one if provided as warehouseId, or we can update API to handle specific from/to
        page: currentPage,
        limit: 12
      });

      this.setState({ 
        transfers: response.items || [],
        totalItems: response.meta?.totalItems || 0
      });
    } catch (error) {
      console.error('Failed to load transfers:', error);
    }
  };

  loadInitialData = async () => {
    try {
      const [warehousesData, allWarehousesData, productsData] = await Promise.all([
        WarehouseService.getAllWarehouses({ all: false }),
        WarehouseService.getAllWarehouses({ all: true }),
        ProductService.getAllProducts()
      ]);
      
      const user = useAuthStore.getState().user;
      const roles = (user?.roles || []).map(r => String(r).toUpperCase());
      const isAdmin = roles.includes('ADMIN') || roles.includes('SYSTEM_ADMIN');
      
      let filteredWarehouses = warehousesData.items || [];
      if (!isAdmin && user?.warehouseIds && user.warehouseIds.length > 0) {
        filteredWarehouses = filteredWarehouses.filter((w: any) => user.warehouseIds!.includes(w.id));
      }

      this.setState({ 
        allWarehouses: allWarehousesData.items || [],
        warehouses: filteredWarehouses, 
        products: productsData.items || [], 
        fromWarehouse: filteredWarehouses.length === 1 ? filteredWarehouses[0].id : ''
      }, () => {
        if (this.state.fromWarehouse) this.recalculateAllStocks();
        this.loadTransfers();
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };
  nextStep = async () => {
    const { currentStep, fromWarehouse, toWarehouse, selectedProduct, quantity, availableStock } = this.state;
    this.setState({ error: null });

    if (currentStep === 1) {
      if (!fromWarehouse || !toWarehouse) {
        this.setState({ error: 'Please select From and To Warehouse.' });
        return;
      }
      if (fromWarehouse === toWarehouse) {
        this.setState({ error: 'Source and Destination warehouses cannot be the same.' });
        return;
      }
      if (!selectedProduct) {
        this.setState({ error: 'Please select a product to transfer.' });
        return;
      }
      if (!quantity || Number(quantity) <= 0) {
        this.setState({ error: 'Please enter a valid quantity.' });
        return;
      }
      if (availableStock === null || Number(quantity) > availableStock) {
        this.setState({ error: `Transfer quantity exceeds available stock! (${availableStock || 0} available)` });
        return;
      }

      this.setState({ currentStep: currentStep + 1 });
    } else if (currentStep === 2) {
      await this.submitStockTransfer();
    }
  };

  submitStockTransfer = async () => {
    this.setState({ isSubmitting: true, error: null });
    const { fromWarehouse, toWarehouse, selectedProduct, quantity, notes } = this.state;
    
    try {
      const dto: CreateStockTransferDto = {
        fromWarehouseId: fromWarehouse,
        toWarehouseId: toWarehouse,
        referenceCode: `TR-${Date.now()}`,
        items: [{
          productId: selectedProduct.id,
          quantity: Number(quantity)
        }],
        notes
      };

      // Chỉ tạo phiếu chuyển kho PENDING
      await StockTransferService.createStockTransfer(dto);

      this.setState({
        showSuccess: true,
        isSubmitting: false,
        fromWarehouse: '',
        toWarehouse: '',
        searchQuery: '',
        selectedProduct: null,
        availableStock: null,
        quantity: '',
        notes: ''
      });

      this.loadInitialData();

      gsap.fromTo('.success-check',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );

      setTimeout(() => {
        this.setState({ currentStep: 1, showSuccess: false });
      }, 3000);

    } catch (e: any) {
      console.error("Stock transfer failed", e);
      this.setState({ isSubmitting: false, error: e.message || 'Có lỗi xảy ra.' });
      // Global toast will handle the error message
    }
  };

  handleApproveTransfer = async (id: string) => {
    try {
      await StockTransferService.approveStockTransfer(id);
      toast.success('Duyệt phiếu điều chuyển thành công');
      this.loadInitialData();
    } catch (e: any) {
      // toast now handled globally in axios.ts
    }
  };

  handleCompleteTransfer = async (id: string) => {
    try {
      await StockTransferService.completeStockTransfer(id);
      toast.success('Hoàn thành phiếu điều chuyển thành công');
      this.loadInitialData();
    } catch (e: any) {
      // toast now handled globally in axios.ts
    }
  };

  handleCancelTransfer = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn huỷ phiếu này?')) return;
    try {
      await StockTransferService.cancelStockTransfer(id);
      toast.success('Đã huỷ phiếu điều chuyển');
      this.loadInitialData();
    } catch (e: any) {
      // toast now handled globally in axios.ts
    }
  };

  handlePrint = (id: string) => {
    this.setState({ printingId: id } as any, () => {
        setTimeout(() => {
            window.print();
            this.setState({ printingId: null } as any);
        }, 500);
    });
  };

  prevStep = () => {
    const { currentStep } = this.state;
    if (currentStep > 1) {
      this.setState({ currentStep: currentStep - 1 });
    }
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, id } = e.target;
    this.setState({ [name || id]: value } as any);

    if ((name === 'fromWarehouse' || id === 'fromWarehouse')) {
       if (value) this.recalculateAllStocks();
       else this.setState({ warehouseStock: [], availableStock: null });
    }
  };

  recalculateAllStocks = async () => {
    if (!this.state.fromWarehouse) return;
    try {
      const stocks = await StockService.getStock({ warehouseId: this.state.fromWarehouse });
      // Only items with quantity > 0
      const availableStocks = stocks.filter((s: any) => s.quantity > 0);
      
      this.setState({ 
        warehouseStock: availableStocks,
        availableStock: this.state.selectedProduct ? (availableStocks.find((s: any) => s.productId === this.state.selectedProduct.id)?.quantity || 0) : null
      });
    } catch (err) {
      console.error('Error recalculating stocks', err);
    }
  };

  handleProductSelect = (product: any) => {
    this.setState({
      selectedProduct: product,
      searchQuery: product.name,
      availableStock: this.state.warehouseStock.find((s: any) => s.productId === product.id)?.quantity || 0
    });
  };

  renderStepContent = () => {
    const {
      currentStep,
      fromWarehouse,
      toWarehouse,
      searchQuery,
      selectedProduct,
      quantity,
      notes
    } = this.state;
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-6">

            {this.state.error && <div className="p-3 bg-red-50 text-red-600 rounded mb-4 text-sm">{this.state.error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fromWarehouse"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                  From Warehouse
                </label>
                <select
                  id="fromWarehouse"
                  name="fromWarehouse"
                  value={fromWarehouse}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                  <option value="">Select source warehouse</option>
                  {this.state.warehouses.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="toWarehouse"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                  To Warehouse
                </label>
                <select
                  id="toWarehouse"
                  name="toWarehouse"
                  value={toWarehouse}
                  onChange={this.handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                  <option value="">Select destination warehouse</option>
                  {this.state.allWarehouses.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="product"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Product
              </label>
              <div className="relative">
                <select
                  id="product"
                  name="productId"
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = this.state.products.find(p => p.id === e.target.value);
                    if (product) this.handleProductSelect(product);
                    else this.setState({ selectedProduct: null, availableStock: null });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select product to transfer</option>
                  {this.state.products
                    .filter(p => this.state.warehouseStock.some(s => s.productId === p.id))
                    .map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))
                  }
                </select>
              </div>
              
              {selectedProduct && this.state.availableStock !== null && (
                 <div className="mt-2 text-sm text-gray-500">
                    Sẵn sàng chuyển: <span className="font-semibold text-blue-600">{this.state.availableStock}</span>
                 </div>
              )}
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={this.handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />

            </div>
            <div>
              <label
                htmlFor="notes"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={this.handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add any additional information">
              </textarea>
            </div>
          </motion.div>);

      case 2:
        return (
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-4">

            {this.state.error && <div className="p-3 bg-red-50 text-red-600 rounded mb-4 text-sm">{this.state.error}</div>}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">
                Review Transfer Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    From Warehouse:
                  </span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {this.state.warehouses.find((w: any) => w.id === fromWarehouse)?.name || ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    To Warehouse:
                  </span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {this.state.allWarehouses.find((w: any) => w.id === toWarehouse)?.name || ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Product:
                  </span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {selectedProduct?.name} ({selectedProduct?.sku})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Quantity:
                  </span>
                  <span className="text-gray-800 dark:text-white font-medium">
                    {quantity}
                  </span>
                </div>
                {notes &&
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Notes:
                    </span>
                    <span className="text-gray-800 dark:text-white font-medium max-w-[70%] text-right">
                      {notes}
                    </span>
                  </div>
                }
              </div>
            </div>
            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor">

                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd" />

                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    This action will transfer stock between warehouses. Please
                    review all details carefully before confirming.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />

              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300">

                I confirm that all the information provided is correct
              </label>
            </div>
          </motion.div>);

      default:
        return null;
    }
  };
  renderTransferHistory = () => {
    const { transfers, warehouses, products, totalItems } = this.state;
    const search: string = (this.state as any).search || '';
    const filterFromWarehouseId: string = (this.state as any).filterFromWarehouseId || '';
    const filterToWarehouseId: string = (this.state as any).filterToWarehouseId || '';
    const currentPage: number = (this.state as any).currentPage || 1;
    const PAGE_SIZE = 12;

    const statusColor: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const paged = transfers;


    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Danh sách phiếu chuyển kho
        </h3>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Tìm mã phiếu..."
            value={search}
            onChange={e => this.setState({ search: e.target.value, currentPage: 1 } as any, () => this.loadTransfers())}
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterFromWarehouseId}
            onChange={e => this.setState({ filterFromWarehouseId: e.target.value, currentPage: 1 } as any, () => this.loadTransfers())}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả kho xuất</option>
            {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select
            value={filterToWarehouseId}
            onChange={e => this.setState({ filterToWarehouseId: e.target.value, currentPage: 1 } as any, () => this.loadTransfers())}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả kho nhập</option>
            {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Mã phiếu', 'Ngày tạo', 'Từ kho', 'Đến kho', 'Sản phẩm', 'SL', 'Trạng thái', 'Hành động'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paged.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-500 text-sm">Không có phiếu chuyển kho nào</td></tr>
              )}
              {paged.map((transfer: any) => {
                const item = transfer.items?.[0] || {};
                const productDisplayName = item.productName || products.find((p: any) => p.id === item.productId)?.name || item.productId || '-';
                const fromName = transfer.fromWarehouseName || warehouses.find((w: any) => w.id === transfer.fromWarehouseId)?.name || transfer.fromWarehouseId;
                const toName = transfer.toWarehouseName || warehouses.find((w: any) => w.id === transfer.toWarehouseId)?.name || transfer.toWarehouseId;
                return (
                  <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {transfer.referenceCode || transfer.id.split('-')[0]}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transfer.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {fromName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {toName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transfer.items?.length > 1 ? `${productDisplayName} +${transfer.items.length - 1}` : productDisplayName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[(transfer.status || '').toUpperCase()] || 'bg-gray-100 text-gray-600'}`}>
                        {(transfer.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => this.setState({ selectedViewId: transfer.id } as any)} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded flex items-center gap-1">
                        <Eye size={14} /> Xem
                      </button>
                      <button onClick={() => this.handlePrint(transfer.id)}
                        className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1">
                        <Printer size={14} /> In phiếu
                      </button>
                      {(transfer.status || '').toUpperCase() === 'PENDING' && (
                        <button onClick={() => this.handleApproveTransfer(transfer.id)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          Duyệt
                        </button>
                      )}
                      {(transfer.status || '').toUpperCase() === 'APPROVED' && (
                        <button onClick={() => this.handleCompleteTransfer(transfer.id)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                          Hoàn thành
                        </button>
                      )}
                      {((transfer.status || '').toUpperCase() === 'PENDING' || (transfer.status || '').toUpperCase() === 'APPROVED') && (
                        <button onClick={() => this.handleCancelTransfer(transfer.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                          Huỷ
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 12 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Hiển thị {Math.min((currentPage - 1) * 12 + 1, totalItems)}–{Math.min(currentPage * 12, totalItems)} / {totalItems} phiếu</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => this.setState({ currentPage: currentPage - 1 } as any, () => this.loadTransfers())}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700">
                ‹
              </button>
              {Array.from({ length: Math.ceil(totalItems / 12) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => this.setState({ currentPage: p } as any, () => this.loadTransfers())}
                  className={`px-3 py-1 rounded border ${p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {p}
                </button>
              ))}
              <button disabled={currentPage === Math.ceil(totalItems / 12)} onClick={() => this.setState({ currentPage: currentPage + 1 } as any, () => this.loadTransfers())}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700">
                ›
              </button>
            </div>
          </div>
        )}


        {/* Detail Modal */}
        {(this.state as any).selectedViewId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full mx-4 my-8 relative z-50 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 rounded-t-xl">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Chi tiết phiếu điều chuyển</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => this.handlePrint((this.state as any).selectedViewId)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                  >
                    <Printer size={18} /> In phiếu
                  </button>
                  <button onClick={() => this.setState({ selectedViewId: null } as any)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                {(() => {
                  const tr = transfers.find((t: any) => t.id === (this.state as any).selectedViewId);
                  if (!tr) return null;
                  
                  return (
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div><span className="text-gray-500">Mã phiếu:</span> <span className="font-medium text-gray-900 dark:text-white">{tr.referenceCode || tr.id.slice(0,8)}</span></div>
                        <div><span className="text-gray-500">Trạng thái:</span> <span className="font-medium text-gray-900 dark:text-white">{(tr.status || '').toUpperCase()}</span></div>
                        <div><span className="text-gray-500">Ngày tạo:</span> <span className="font-medium text-gray-900 dark:text-white">{tr.createdAt ? new Date(tr.createdAt).toLocaleString('vi-VN') : '-'}</span></div>
                        <div><span className="text-gray-500">Từ kho:</span> <span className="font-medium text-gray-900 dark:text-white">{warehouses.find((w: any) => w.id === tr.fromWarehouseId)?.name || tr.fromWarehouseId}</span></div>
                        <div><span className="text-gray-500">Đến kho:</span> <span className="font-medium text-gray-900 dark:text-white">{warehouses.find((w: any) => w.id === tr.toWarehouseId)?.name || tr.toWarehouseId}</span></div>
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-3">Sản phẩm điều chuyển</h4>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Sản phẩm</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Số lượng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {(tr.items || []).map((item: any, idx: number) => {
                             const product = this.state.products.find(p => p.id === item.productId);
                             const productDisplayName = item.productName || product?.name || item.productId;
                             const qty = Number(item.quantity);
                             return (
                               <tr key={item.id || idx}>
                                 <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{productDisplayName}</td>
                                 <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{qty}</td>
                               </tr>
                             )
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/30 font-semibold">
                          <tr>
                            <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">Tổng số lượng:</td>
                            <td className="px-4 py-3 text-right text-sm text-blue-600 dark:text-blue-400">
                              {(tr.items || []).reduce((acc: number, item: any) => acc + Number(item.quantity), 0).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="mt-8">
                        <NoteSection entityType="stock_transfer" entityId={tr.id} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            {/* Backdrop explicit click */}
            <div className="absolute inset-0 -z-10" onClick={() => this.setState({ selectedViewId: null } as any)}></div>
          </div>
        )}
      </div>
    );
  };
  render() {
    const { currentStep, showSuccess } = this.state;
    const steps = [
    {
      id: 1,
      name: 'Transfer Details'
    },
    {
      id: 2,
      name: 'Review'
    }];

    return (
      <div>
        {showSuccess ?
        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center mb-8"
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 0.5
          }}>

            <div className="success-check mx-auto mb-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-4 inline-block">
              <Check size={36} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Phiếu chuyển kho đã được tạo!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Phiếu đang ở trạng thái <strong>Chờ duyệt (PENDING)</strong>. Người có quyền có thể duyệt và hoàn thành phiếu trong danh sách bên dưới.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}
              onClick={() =>
              this.setState({
                currentStep: 1,
                showSuccess: false
              })
              }>

                Create Another Transfer
              </motion.button>
              <motion.button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              whileHover={{
                scale: 1.05
              }}
              whileTap={{
                scale: 0.95
              }}>

                View Inventory
              </motion.button>
            </div>
          </motion.div> :

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => this.setState({ isFormExpanded: !(this.state as any).isFormExpanded } as any)}
            >
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                    <Plus size={20} />
                 </div>
                 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tạo phiếu điều chuyển</h2>
              </div>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {(this.state as any).isFormExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            <AnimatePresence>
              {(this.state as any).isFormExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-200 dark:border-gray-700">
              <nav className="px-6 py-4">
                <ol className="flex items-center">
                  {steps.map((step, stepIdx) =>
                <li
                  key={step.id}
                  className={`flex items-center ${stepIdx !== steps.length - 1 ? 'w-full' : ''}`}>

                      <div
                    className={`flex items-center ${currentStep >= step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>

                        <div
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${currentStep >= step.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>

                          {step.id}
                        </div>
                        <p
                      className={`ml-3 text-sm font-medium ${currentStep >= step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>

                          {step.name}
                        </p>
                      </div>
                      {stepIdx !== steps.length - 1 &&
                  <div className="flex-auto mx-4 border-t-2 border-gray-200 dark:border-gray-700"></div>
                  }
                    </li>
                )}
                </ol>
              </nav>
            </div>
            <div className="p-6">
              {this.renderStepContent()}
              <div className="flex justify-between mt-8">
                <motion.button
                whileHover={{
                  scale: 1.05
                }}
                whileTap={{
                  scale: 0.95
                }}
                className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${currentStep === 1 ? 'invisible' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={this.prevStep}
                disabled={currentStep === 1}>

                  Back
                </motion.button>
                <motion.button
                whileHover={this.state.isSubmitting ? {} : { scale: 1.05 }}
                whileTap={this.state.isSubmitting ? {} : { scale: 0.95 }}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md flex items-center ${this.state.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={this.nextStep}
                disabled={this.state.isSubmitting}>

                  {currentStep < 2 ?
                <>
                      Next <ArrowRight size={16} className="ml-2" />
                    </> :

                (this.state.isSubmitting ? 'Processing...' : 'Confirm Transfer')
                }
                </motion.button>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
        {/* Recent Stock Transfers */}
        {!showSuccess && this.renderTransferHistory()}

        {/* Print Layout (Hidden for screen) */}
        {(this.state as any).printingId && (
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                {(() => {
                    const tr = this.state.transfers.find((t: any) => t.id === (this.state as any).printingId);
                    if (!tr) return null;
                    return <SlipPrintLayout type="TRANSFER" data={tr} />;
                })()}
            </div>
        )}
      </div>);
  }
}