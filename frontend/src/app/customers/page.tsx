"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, User, Mail, Phone, Loader2, History } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/common/PageHeader';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ActionGuard } from '@/components/common/ActionGuard';
import { Customer } from '@/types/partners/customer';
import { CustomerService } from '@/services/partners/customer.service';
import { getPartnerStatusClass, getPartnerStatusLabel, PartnerStatus } from '@/lib/partnerStatus';
import { toast } from 'sonner';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';

const CustomerModal = dynamic(() => import('./CustomerModal').then(mod => mod.CustomerModal), {
  ssr: false
});

const CustomerHistoryModal = dynamic(() => import('./CustomerHistoryModal').then(mod => mod.CustomerHistoryModal), {
  ssr: false
});

interface CustomersState {
  customers: Customer[];
  isModalOpen: boolean;
  selectedCustomer: Customer | null;
  isLoading: boolean;
  filters: {
    search: string;
    customerType: string;
    status: string;
  };
  isHistoryModalOpen: boolean;
  selectedCustomerForHistory: Customer | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
export default class CustomersPage extends Component<{}, CustomersState> {
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      customers: [],
      isModalOpen: false,
      selectedCustomer: null,
      isLoading: true,
      filters: { search: '', customerType: '', status: '' },
      isHistoryModalOpen: false,
      selectedCustomerForHistory: null,
      currentPage: 1,
      pageSize: 10,
      totalItems: 0
    };
  }

  componentWillUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  componentDidMount() {
    this.fetchCustomers();
  }

  fetchCustomers = async () => {
    try {
      this.setState({ isLoading: true });
      const { search, customerType, status } = this.state.filters;
      const { currentPage, pageSize } = this.state;
      const response = await CustomerService.getAllCustomers({ 
        search, 
        customerType, 
        status,
        page: currentPage,
        limit: pageSize
      });
      this.setState({ customers: response.items, totalItems: response.meta.totalItems });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleFilterChange = (key: keyof CustomersState['filters'], value: string) => {
    this.setState(
      (prev) => ({ filters: { ...prev.filters, [key]: value }, currentPage: 1 }),
      () => { if (key !== 'search') this.fetchCustomers(); }
    );
  };

  handleSearchChange = (value: string) => {
    this.setState((prev) => ({ filters: { ...prev.filters, search: value }, currentPage: 1 }));
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetchCustomers(), 500);
  };

  handlePageChange = (page: number) => {
    this.setState({ currentPage: page }, () => this.fetchCustomers());
  };

  openModal = (customer: Customer | null = null) => {
    this.setState({ isModalOpen: true, selectedCustomer: customer });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false, selectedCustomer: null });
  };

  openHistoryModal = (customer: Customer) => {
    this.setState({ isHistoryModalOpen: true, selectedCustomerForHistory: customer });
  };

  closeHistoryModal = () => {
    this.setState({ isHistoryModalOpen: false, selectedCustomerForHistory: null });
  };

  formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  getLoyaltyBadgeClass = (tier: string) => {
    switch (tier) {
      case 'Gold'   : return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Silver' : return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
      case 'Bronze' : return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default       : return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  handleSave = async (data: Partial<Customer>) => {
    try {
      const { selectedCustomer } = this.state;
      if (selectedCustomer) {
        await CustomerService.updateCustomer(selectedCustomer.id, data);
        toast.success('Cập nhật khách hàng thành công');
      } else {
        await CustomerService.createCustomer(data);
        toast.success('Thêm khách hàng thành công');
      }
      this.closeModal();
      this.fetchCustomers();
    } catch (error) {
      console.error('Failed to save customer:', error);
      toast.error('Có lỗi xảy ra khi lưu khách hàng');
    }
  };

  handleDelete = async (customer: Customer) => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng ${customer.name}?`)) {
          try {
              await CustomerService.deleteCustomer(customer.id);
              toast.success('Xóa khách hàng thành công');
              this.fetchCustomers();
          } catch (error) {
              console.error('Failed to delete customer:', error);
              toast.error('Không thể xóa khách hàng');
          }
      }
  };

  render() {
    const { customers, totalItems, isModalOpen, selectedCustomer, isLoading, filters, currentPage, pageSize } = this.state;
    

    if (isLoading && customers.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }
    return (
      <div>
        <PageHeader 
          title="Khách hàng" 
          description="Quản lý thông tin khách hàng"
          actionLabel="Thêm khách hàng"
          onAction={() => this.openModal()}
          actionPermission="customer.create"
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <TableToolbar 
            searchPlaceholder="Tìm kiếm khách hàng..."
            searchValue={filters.search}
            onSearchChange={this.handleSearchChange}
            filters={[
                { 
                    label: 'Loại', 
                    value: filters.customerType,
                    options: [
                        { value: 'Individual', label: 'Cá nhân' },
                        { value: 'Business', label: 'Doanh nghiệp' }
                    ],
                    onChange: (value) => this.handleFilterChange('customerType', value)
                }, 
                { 
                    label: 'Trạng thái',
                    value: filters.status,
                    options: [
                        { value: PartnerStatus.ACTIVE, label: 'Hoạt động' },
                        { value: PartnerStatus.INACTIVE, label: 'Không hoạt động' },
                        { value: PartnerStatus.BLOCKED, label: 'Bị chặn' }
                    ],
                    onChange: (value) => this.handleFilterChange('status', value)
                }
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hạng thành viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer, index) =>
                <motion.tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  whileHover={{
                    scale: 1.01
                  }}
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05
                  }}>

                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User size={20} className="text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.customerType === 'Business' ? customer.companyName : 'Cá nhân'}
                            </div>
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center mb-1">
                          <Mail size={12} className="mr-1 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center">
                          <Phone size={12} className="mr-1 text-gray-400" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {customer.totalOrders?customer.totalOrders:0} đơn
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {this.formatCurrency(customer.totalSpent?customer.totalSpent:0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge className={this.getLoyaltyBadgeClass(customer.loyaltyTier)}>
                        {customer.loyaltyTier}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge className={getPartnerStatusClass(customer.status)}>
                        {getPartnerStatusLabel(customer.status)}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ActionGuard permission="customer.update">
                        <>
                          <motion.button
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 mr-3"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => this.openHistoryModal(customer)}
                          title="Lịch sử mua hàng">
                            <History size={16} />
                          </motion.button>
                          <motion.button
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => this.openModal(customer)}
                          title="Chỉnh sửa">
                            <Edit size={16} />
                          </motion.button>
                        </>
                      </ActionGuard>
                      <ActionGuard permission="customer.delete">
                        <motion.button
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => this.handleDelete(customer)}>
                          <Trash2 size={16} />
                        </motion.button>
                      </ActionGuard>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            totalItems={totalItems} 
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={this.handlePageChange}
            labelShowing="Đang hiển thị"
            labelTo="đến"
            labelOf="trong"
            labelResults="khách hàng"
            labelPrevious="Trước"
            labelNext="Sau"
          />
        </div>

        {isModalOpen &&
        <CustomerModal
          isOpen={isModalOpen}
          onClose={this.closeModal}
          customer={selectedCustomer}
          onSave={this.handleSave} />
        }

        {this.state.isHistoryModalOpen &&
        <CustomerHistoryModal
          isOpen={this.state.isHistoryModalOpen}
          onClose={this.closeHistoryModal}
          customer={this.state.selectedCustomerForHistory} />
        }
      </div>);
  }
}
