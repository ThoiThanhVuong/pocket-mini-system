import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Check, Package, Truck, Eye, X, ChevronDown, ChevronUp, Plus, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { NoteSection } from '@/components/system/NoteSection';
import { SlipPrintLayout } from '@/components/inventory/SlipPrintLayout';
import { SupplierService } from '@/services/partners/supplier.service';
import { ProductService } from '@/services/inventory/product.service';
import { WarehouseService } from '@/services/inventory/warehouse.service';
import { StockInService } from '@/services/inventory/stock-in.service';
import { CreateStockInDto, StockInState, StockInItemState } from '@/types/inventory/stock-in';
import { PaymentService } from '@/services/finance/payment.service';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export class StockIn extends Component<{}, StockInState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentStep: 1,
      showSuccess: false,
      suppliers: [],
      products: [],
      warehouses: [],
      stockIns: [],
      supplierId: '',
      warehouseId: '',
      referenceCode: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [{ productId: '', quantity: '', unitCost: '' }],
      isSubmitting: false,
      error: null,
      selectedViewId: null
    };
  }

  async componentDidMount() {
    try {
      const [suppliersData, productsData, warehousesData] = await Promise.all([
        SupplierService.getAllSuppliers(),
        ProductService.getAllProducts(),
        WarehouseService.getAllWarehouses()
      ]);
      
      const user = useAuthStore.getState().user;
      const roles = (user?.roles || []).map(r => String(r).toUpperCase());
      const isAdmin = roles.includes('ADMIN') || roles.includes('SYSTEM_ADMIN');
      
      let filteredWarehouses = warehousesData;
      if (!isAdmin && user?.warehouseIds && user.warehouseIds.length > 0) {
        filteredWarehouses = warehousesData.filter(w => user.warehouseIds!.includes(w.id));
      }

      this.setState({ 
        suppliers: suppliersData, 
        products: productsData, 
        warehouses: filteredWarehouses,
        warehouseId: filteredWarehouses.length === 1 ? filteredWarehouses[0].id : ''
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
    this.loadStockIns();
  }

  loadStockIns = async () => {
    try {
      const [data, paymentsData] = await Promise.all([
        StockInService.getAllStockIns(),
        api.get('/payments').then(res => res.data.data).catch(() => [])
      ]);
      const mappedData = (data || []).map((d: any) => {
        const p = paymentsData.find((pmt: any) => pmt.referenceId === d.id);
        return { ...d, paymentStatus: p?.status || 'pending' };
      });
      // Sort by newest first
      mappedData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.setState({ stockIns: mappedData });
    } catch (error) {
      console.error('Failed to load stock-ins:', error);
    }
  };

  handleApprove = async (id: string) => {
    try {
      await StockInService.approveStockIn(id);
      toast.success('Duyệt phiếu nhập kho thành công');
      this.loadStockIns();
    } catch (e: any) {
      // toast now handled globally in axios.ts
    }
  };

  handleComplete = async (id: string) => {
    try {
      await StockInService.completeStockIn(id);
      toast.success('Hoàn thành phiếu nhập kho thành công');
      this.loadStockIns();
    } catch (e: any) {
      // toast now handled globally in axios.ts
    }
  };

  handleCancelStockIn = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn huỷ phiếu này?')) return;
    try {
      await StockInService.cancelStockIn(id);
      toast.success('Đã huỷ phiếu nhập kho');
      this.loadStockIns();
    } catch (e: any) {
      // toast now handled globally in axios.ts
    }
  };

  handlePay = (id: string) => {
    this.setState({ showPaymentModal: true, paymentReferenceId: id, paymentMethod: 'cash' } as any);
  };

  handlePrint = (id: string) => {
    this.setState({ printingId: id } as any, () => {
        setTimeout(() => {
            window.print();
            this.setState({ printingId: null } as any);
        }, 500);
    });
  };

  submitPayment = async () => {
    const { paymentReferenceId, paymentMethod } = this.state as any;
    if (!paymentReferenceId) return;
    
    this.setState({ isProcessingPayment: true } as any);
    try {
      await api.post(`/payments/reference/${paymentReferenceId}/pay`, { method: paymentMethod });
      toast.success('Xác nhận thanh toán thành công');
      await this.loadStockIns();
      this.setState({ showPaymentModal: false, paymentReferenceId: null, isProcessingPayment: false } as any);
    } catch (e: any) {
      // toast now handled globally in axios.ts
      this.setState({ isProcessingPayment: false } as any);
    }
  };

  handleExport = async () => {
    this.setState({ isExporting: true } as any);
    try {
      const { filterWarehouseId } = this.state as any;
      let url = '/stock-in/export';
      if (filterWarehouseId) {
        url += `?warehouseId=${filterWarehouseId}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'ds-phieu-nhap.xlsx';
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

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, id } = e.target;
    this.setState({ [name || id]: value } as any);
  };

  handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...this.state.items];
    const numValue = value === '' ? '' : Number(value);
    
    newItems[index] = { ...newItems[index], [field]: field === 'productId' ? value : numValue };
    
    // Auto fill unit cost when product is selected
    if (field === 'productId' && value) {
      const product = this.state.products.find(p => p.id === value);
      if (product) {
        newItems[index].unitCost = product.price || 0;
      }
    }
    
    this.setState({ items: newItems });
  };

  addItem = () => {
    this.setState({ items: [...this.state.items, { productId: '', quantity: '', unitCost: '' }] });
  };

  nextStep = async () => {
    const { currentStep, supplierId, items } = this.state;
    this.setState({ error: null });

    if (currentStep === 1) {
      if (!supplierId || !this.state.warehouseId) {
        this.setState({ error: 'Please select a supplier and a warehouse.' });
        return;
      }
      this.setState({ currentStep: currentStep + 1 });
    } else if (currentStep === 2) {
      const validItems = items.filter(i => i.productId && Number(i.quantity) > 0 && Number(i.unitCost) >= 0);
      if (validItems.length === 0) {
        this.setState({ error: 'Please add at least one valid product.' });
        return;
      }
      this.setState({ items: validItems, currentStep: currentStep + 1 });
    } else if (currentStep === 3) {
      await this.submitStockIn();
    }
  };

  submitStockIn = async () => {
    this.setState({ isSubmitting: true, error: null });
    const { supplierId, warehouseId, referenceCode, notes, items } = this.state;
    
    try {
      const dto: CreateStockInDto = {
        supplierId,
        warehouseId,
        referenceCode: referenceCode || `PO-${Date.now()}`,
        items: items.map(i => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          price: Number(i.unitCost)
        })),
        notes
      };
      // Chỉ tạo phiếu nhập kho PENDING, KHÔNG DUYỆT TỰ ĐỘNG NỮA
      const stockIn = await StockInService.createStockIn(dto);

      this.setState({
        showSuccess: true,
        isSubmitting: false,
        supplierId: '',
        warehouseId: '',
        referenceCode: '',
        notes: '',
        items: [{ productId: '', quantity: '', unitCost: '' }]
      });

      // Reload table immediately so user sees the new record
      await this.loadStockIns();

      gsap.fromTo('.success-check',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );

      setTimeout(() => {
        this.setState({ currentStep: 1, showSuccess: false });
      }, 3000);

    } catch (e: any) {
      console.error("Stock in failed", e);
      this.setState({ isSubmitting: false, error: e.message || 'Có lỗi xảy ra.' });
    }
  };

  prevStep = () => {
    const { currentStep } = this.state;
    if (currentStep > 1) {
      this.setState({
        currentStep: currentStep - 1
      });
    }
  };
  renderStepContent = () => {
    const { currentStep } = this.state;
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
            className="space-y-4">

            {this.state.error && <div className="p-3 bg-red-50 text-red-600 rounded mb-4 text-sm">{this.state.error}</div>}
            <div className="mb-4">
              <label
                htmlFor="supplier"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Select Supplier
              </label>
              <select
                id="supplier"
                name="supplierId"
                value={this.state.supplierId}
                onChange={this.handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                <option value="">Select supplier</option>
                {this.state.suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name || s.companyName}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="warehouse"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Select Warehouse
              </label>
              <select
                id="warehouse"
                name="warehouseId"
                value={this.state.warehouseId}
                onChange={this.handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                <option value="">Select warehouse</option>
                {this.state.warehouses.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="reference"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Reference Number
              </label>
              <input
                type="text"
                id="reference"
                name="referenceCode"
                value={this.state.referenceCode}
                onChange={this.handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. PO-2023-001" />

            </div>
            <div className="mb-4">
              <label
                htmlFor="date"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={this.state.date}
                onChange={this.handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />

            </div>
            <div className="mb-4">
              <label
                htmlFor="notes"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={this.state.notes}
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
            <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {this.state.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <select value={item.productId} onChange={(e) => this.handleItemChange(index, 'productId', e.target.value)} className="w-full text-sm border-0 focus:ring-0 bg-transparent dark:text-white">
                        <option value="">Select product</option>
                        {this.state.products.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => this.handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full text-sm border-0 focus:ring-0 bg-transparent dark:text-white"
                        placeholder="0" />

                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => this.handleItemChange(index, 'unitCost', e.target.value)}
                        className="w-full text-sm border-0 focus:ring-0 bg-transparent dark:text-white"
                        placeholder="0.00" />

                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      ${((Number(item.quantity) || 0) * (Number(item.unitCost) || 0)).toLocaleString()}
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <motion.button
              whileHover={{
                scale: 1.02
              }}
              whileTap={{
                scale: 0.98
              }}
              onClick={this.addItem}
              className="text-blue-600 dark:text-blue-400 text-sm flex items-center">

              <Plus size={16} className="mr-1" /> Add Another Product
            </motion.button>
            <div className="flex justify-end mt-4">
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700 dark:text-gray-300">
                    Total Amount:
                  </span>
                  <span className="text-gray-800 dark:text-white text-lg">
                    ${this.state.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitCost) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>);

      case 3:
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
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                Review Stock In Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Supplier:
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {this.state.suppliers.find(s => s.id === this.state.supplierId)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Warehouse:
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {this.state.warehouses.find(w => w.id === this.state.warehouseId)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Reference:
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {this.state.referenceCode || 'Auto-generated'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Date:
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {this.state.date}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Products:
                  </span>
                  <span className="text-gray-800 dark:text-white">{this.state.items.length} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Amount:
                  </span>
                  <span className="text-gray-800 dark:text-white font-medium text-base">
                    ${this.state.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitCost) || 0), 0).toLocaleString()}
                  </span>
                </div>
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
                    Please review all details carefully before confirming. This
                    action cannot be undone.
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
  render() {
    const { currentStep, showSuccess } = this.state;
    const steps = [
    {
      id: 1,
      name: 'Information',
      icon: <Truck size={16} />
    },
    {
      id: 2,
      name: 'Products',
      icon: <Package size={16} />
    },
    {
      id: 3,
      name: 'Review',
      icon: <Check size={16} />
    }];

    return (
      <div>
        {showSuccess ?
        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
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
              Stock In Recorded Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your inventory has been updated with the new stock.
            </p>
            <div className="flex justify-center space-x-4">
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

                Add Another
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
                 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tạo phiếu nhập kho</h2>
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

                          {step.icon}
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

                  {currentStep < 3 ?
                <>
                      Next <ArrowRight size={16} className="ml-2" />
                    </> :

                (this.state.isSubmitting ? 'Processing...' : 'Confirm Stock In')
                }
                </motion.button>
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
        {this.renderHistory()}
      </div>);

  }

  renderHistory = () => {
    const { stockIns, warehouses, suppliers } = this.state;
    const search: string = (this.state as any).search || '';
    const filterWarehouseId: string = (this.state as any).filterWarehouseId || '';
    const filterSupplierId: string = (this.state as any).filterSupplierId || '';
    const currentPage: number = (this.state as any).currentPage || 1;
    const PAGE_SIZE = 12;

    const statusColor: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const filtered = stockIns.filter((so: any) => {
      const warehouseName = so.warehouseName || warehouses.find((w: any) => w.id === so.warehouseId)?.name || '';
      const suppName = so.supplierName || suppliers.find((c: any) => c.id === so.supplierId)?.name || '';
      const matchSearch = !search || 
        (so.referenceCode || '').toLowerCase().includes(search.toLowerCase()) ||
        suppName.toLowerCase().includes(search.toLowerCase());
      const matchWarehouse = !filterWarehouseId || so.warehouseId === filterWarehouseId;
      const matchSupplier = !filterSupplierId || so.supplierId === filterSupplierId;
      return matchSearch && matchWarehouse && matchSupplier;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Danh sách phiếu nhập</h3>
          <button 
            onClick={this.handleExport}
            disabled={(this.state as any).isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <Download size={18} /> {(this.state as any).isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
        
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Tìm mã phiếu / nhà cung cấp..."
            value={search}
            onChange={e => this.setState({ search: e.target.value, currentPage: 1 } as any)}
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterWarehouseId}
            onChange={e => this.setState({ filterWarehouseId: e.target.value, currentPage: 1 } as any)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả kho</option>
            {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select
            value={filterSupplierId}
            onChange={e => this.setState({ filterSupplierId: e.target.value, currentPage: 1 } as any)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Mã phiếu','Nhà cung cấp','Kho','Ngày tạo','Trạng thái','Thanh toán','Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paged.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500 text-sm">Không có phiếu nhập nào</td></tr>
              )}
              {paged.map((so: any) => {
                const warehouseName = so.warehouseName || warehouses.find((w: any) => w.id === so.warehouseId)?.name || so.warehouseId;
                const suppName = so.supplierName || suppliers.find((c: any) => c.id === so.supplierId)?.name || so.supplierId;
                
                let paymentColor = 'bg-yellow-100 text-yellow-800';
                if (so.paymentStatus === 'paid') paymentColor = 'bg-green-100 text-green-800';
                if (so.paymentStatus === 'failed') paymentColor = 'bg-red-100 text-red-800';
                if (so.paymentStatus === 'refunded') paymentColor = 'bg-purple-100 text-purple-800';

                return (
                  <tr key={so.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{so.referenceCode || so.id.slice(0,8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{suppName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{warehouseName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{so.createdAt ? new Date(so.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[(so.status || '').toUpperCase()] || 'bg-gray-100 text-gray-600'}`}>
                        {(so.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentColor}`}>
                        {(so.paymentStatus || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      <button onClick={() => this.setState({ selectedViewId: so.id } as any)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 flex items-center gap-1">
                        <Eye size={14} /> Xem
                      </button>
                      {so.paymentStatus === 'pending' && (so.status || '').toUpperCase() !== 'CANCELLED' && (
                        <button onClick={() => this.handlePay(so.id)}
                          className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">
                          Chi tiền
                        </button>
                      )}
                      {(so.status || '').toUpperCase() === 'PENDING' && (
                        <button onClick={() => this.handleApprove(so.id)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          Duyệt
                        </button>
                      )}
                      {(so.status || '').toUpperCase() === 'APPROVED' && (
                        <button onClick={() => this.handleComplete(so.id)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                          Hoàn thành
                        </button>
                      )}
                      {((so.status || '').toUpperCase() === 'PENDING' || (so.status || '').toUpperCase() === 'APPROVED') && (
                        <button onClick={() => this.handleCancelStockIn(so.id)}
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Hiển thị {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} phiếu</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => this.setState({ currentPage: currentPage - 1 } as any)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700">
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => this.setState({ currentPage: p } as any)}
                  className={`px-3 py-1 rounded border ${p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {p}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => this.setState({ currentPage: currentPage + 1 } as any)}
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
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Chi tiết phiếu nhập</h3>
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
                  const so = stockIns.find((s: any) => s.id === (this.state as any).selectedViewId);
                  if (!so) return null;
                  
                  return (
                    <div>
                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div><span className="text-gray-500">Mã phiếu:</span> <span className="font-medium text-gray-900 dark:text-white">{so.referenceCode || so.id.slice(0,8)}</span></div>
                        <div><span className="text-gray-500">Trạng thái:</span> <span className="font-medium text-gray-900 dark:text-white">{(so.status || '').toUpperCase()}</span></div>
                        <div><span className="text-gray-500">Ngày tạo:</span> <span className="font-medium text-gray-900 dark:text-white">{so.createdAt ? new Date(so.createdAt).toLocaleString('vi-VN') : '-'}</span></div>
                        <div><span className="text-gray-500">Kho:</span> <span className="font-medium text-gray-900 dark:text-white">{warehouses.find((w: any) => w.id === so.warehouseId)?.name || so.warehouseId}</span></div>
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-3">Sản phẩm</h4>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Sản phẩm</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Số lượng</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Đơn giá</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {(so.items || []).map((item: any) => {
                             const product = this.state.products.find(p => p.id === item.productId);
                             const productDisplayName = item.productName || product?.name || item.productId;
                             const qty = Number(item.quantity);
                             const price = Number(item.price);
                             return (
                               <tr key={item.id}>
                                 <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{productDisplayName}</td>
                                 <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{qty}</td>
                                 <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">{price.toLocaleString('vi-VN')} đ</td>
                                 <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">{(qty * price).toLocaleString('vi-VN')} đ</td>
                               </tr>
                             )
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/30 font-semibold">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">Tổng cộng:</td>
                            <td className="px-4 py-3 text-right text-sm text-blue-600 dark:text-blue-400">
                              {(so.items || []).reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.price)), 0).toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="mt-8 uppercase">
                        <NoteSection entityType="stock_in" entityId={so.id} />
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

        {/* Payment Modal */}
        {(this.state as any).showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl z-50 my-8"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xác nhận thanh toán</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Vui lòng chọn phương thức thanh toán cho phiếu này.</p>
              
              <div className="space-y-3 mb-6">
                {[
                  { id: 'cash', label: 'Tiền mặt' }, 
                  { id: 'bank', label: 'Chuyển khoản' }, 
                  { id: 'credit', label: 'Thẻ tín dụng' }
                ].map((method) => (
                  <label key={method.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    (this.state as any).paymentMethod === method.id 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.id} 
                      checked={(this.state as any).paymentMethod === method.id}
                      onChange={(e) => this.setState({ paymentMethod: e.target.value } as any)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3 justify-end mt-8">
                <button 
                  onClick={() => this.setState({ showPaymentModal: false, paymentReferenceId: null } as any)}
                  className="px-5 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                  disabled={(this.state as any).isProcessingPayment}
                >
                  Hủy
                </button>
                <button 
                  onClick={this.submitPayment}
                  className="px-5 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center shadow-sm transition-colors"
                  disabled={(this.state as any).isProcessingPayment}
                >
                  {(this.state as any).isProcessingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => !((this.state as any).isProcessingPayment) && this.setState({ showPaymentModal: false, paymentReferenceId: null } as any)}></div>
          </div>
        )}

        {/* Print Layout (Hidden for screen) */}
        {(this.state as any).printingId && (
            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                {(() => {
                    const so = stockIns.find((s: any) => s.id === (this.state as any).printingId);
                    if (!so) return null;
                    const supplier = suppliers.find(s => s.id === so.supplierId);
                    return <SlipPrintLayout type="IN" data={{ ...so, supplierName: supplier?.name || supplier?.companyName }} />;
                })()}
            </div>
        )}
      </div>
    );
  };
}