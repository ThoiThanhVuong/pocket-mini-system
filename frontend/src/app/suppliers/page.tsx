"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Building2, Mail, Phone, Loader2, User2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/common/PageHeader';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ActionGuard } from '@/components/common/ActionGuard';
import { Supplier } from '@/types/partners/supplier';
import { SupplierService } from '@/services/partners/supplier.service';
import { getPartnerStatusClass, getPartnerStatusLabel, PartnerStatus } from '@/lib/partnerStatus';
import { toast } from 'sonner';
import { ExcelImportButton } from '@/components/common/ExcelImportButton';

const SupplierModal = dynamic(() => import('./SupplierModal').then(mod => mod.SupplierModal), {
  ssr: false
});

interface SuppliersState {
  suppliers: Supplier[];
  isModalOpen: boolean;
  selectedSupplier: Supplier | null;
  isLoading: boolean;
  filters: {
    search: string;
    status: string;
  };
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default class SuppliersPage extends Component<{}, SuppliersState> {
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      suppliers: [],
      isModalOpen: false,
      selectedSupplier: null,
      isLoading: true,
      filters: { search: '', status: '' },
      currentPage: 1,
      pageSize: 10,
      totalItems: 0
    };
  }

  componentDidMount() {
    this.fetchSuppliers();
  }

  componentWillUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  fetchSuppliers = async () => {
    try {
      this.setState({ isLoading: true });
      const { search, status } = this.state.filters;
      const { currentPage, pageSize } = this.state;
      const response = await SupplierService.getAllSuppliers({ 
        search, 
        status,
        page: currentPage,
        limit: pageSize
      });
      this.setState({ 
        suppliers: response.items, 
        totalItems: response.meta.totalItems 
      });
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      toast.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleFilterChange = (key: keyof SuppliersState['filters'], value: string) => {
    this.setState(
      prevState => ({ filters: { ...prevState.filters, [key]: value }, currentPage: 1 }),
      () => { if (key !== 'search') this.fetchSuppliers(); }
    );
  };

  handleSearchChange = (value: string) => {
    this.setState((prev) => ({ filters: { ...prev.filters, search: value }, currentPage: 1 }));
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetchSuppliers(), 500);
  };

  handlePageChange = (page: number) => {
    this.setState({ currentPage: page }, () => this.fetchSuppliers());
  };

  openModal = (supplier: Supplier | null = null) => {
    this.setState({ isModalOpen: true, selectedSupplier: supplier });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false, selectedSupplier: null });
  };

  handleSave = async (data: Partial<Supplier>) => {
    try {
      const { selectedSupplier } = this.state;
      if (selectedSupplier) {
        await SupplierService.updateSupplier(selectedSupplier.id, data);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await SupplierService.createSupplier(data);
        toast.success('Thêm nhà cung cấp thành công');
      }
      this.closeModal();
      this.fetchSuppliers();
    } catch (error) {
      console.error('Failed to save supplier:', error);
      toast.error('Có lỗi xảy ra khi lưu nhà cung cấp');
    }
  };

  handleDelete = async (supplier: Supplier) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp ${supplier.name}?`)) {
      try {
        await SupplierService.deleteSupplier(supplier.id);
        toast.success('Xóa nhà cung cấp thành công');
        this.fetchSuppliers();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
        toast.error('Không thể xóa nhà cung cấp');
      }
    }
  };


  render() {
    const { suppliers, totalItems, isModalOpen, selectedSupplier, isLoading, filters, currentPage, pageSize } = this.state;
    

    if (isLoading && suppliers.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        <PageHeader
          title="Nhà cung cấp"
          description="Quản lý thông tin nhà cung cấp"
          actionLabel="Thêm nhà cung cấp"
          onAction={() => this.openModal()}
          actionPermission="supplier.create"
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <TableToolbar
            searchPlaceholder="Tìm kiếm nhà cung cấp..."
            searchValue={filters.search}
            onSearchChange={this.handleSearchChange}
            filters={[
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
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Người liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Địa chỉ
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
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Chưa có nhà cung cấp nào
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier, index) => (
                    <motion.tr
                      key={supplier.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      whileHover={{ scale: 1.005 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {supplier.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <User2 size={14} className="mr-2 text-gray-400" />
                          {supplier.contactPerson}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center mb-1">
                            <Mail size={12} className="mr-1 text-gray-400" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={12} className="mr-1 text-gray-400" />
                            {supplier.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {supplier.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge className={getPartnerStatusClass(supplier.status)}>
                          {getPartnerStatusLabel(supplier.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionGuard permission="supplier.update">
                          <motion.button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => this.openModal(supplier)}
                          >
                            <Edit size={16} />
                          </motion.button>
                        </ActionGuard>
                        <ActionGuard permission="supplier.delete">
                          <motion.button
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => this.handleDelete(supplier)}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </ActionGuard>
                      </td>
                    </motion.tr>
                  ))
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
            labelResults="nhà cung cấp"
            labelPrevious="Trước"
            labelNext="Sau"
          />
        </div>

        {isModalOpen && (
          <SupplierModal
            isOpen={isModalOpen}
            onClose={this.closeModal}
            supplier={selectedSupplier}
            onSave={this.handleSave}
          />
        )}
      </div>
    );
  }
}
