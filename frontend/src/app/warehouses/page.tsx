"use client";

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  MapPin,
  Eye } from
'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/common/PageHeader';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Warehouse } from '@/types/inventory/warehouse';
import { WarehouseService } from '@/services/inventory/warehouse.service';

const WarehouseModal = dynamic(() => import('./WarehouseModal').then(mod => mod.WarehouseModal), {
  ssr: false
});

const WarehouseStockModal = dynamic(() => import('./WarehouseStockModal').then(mod => mod.WarehouseStockModal), {
  ssr: false
});

interface WarehousesState {
  warehouses: any[];
  isModalOpen: boolean;
  selectedWarehouse: any | null;
  searchTerm: string;
  filterStatus: string;
  isStockModalOpen: boolean;
  selectedWarehouseForStock: any | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
export default class WarehousesPage extends Component<{}, WarehousesState> {
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      warehouses: [],
      isModalOpen: false,
      selectedWarehouse: null,
      searchTerm: '',
      filterStatus: '',
      isStockModalOpen: false,
      selectedWarehouseForStock: null,
      currentPage: 1,
      pageSize: 10,
      totalItems: 0
    };
  }

  loadWarehouses = async () => {
    try {
      const { currentPage, pageSize, searchTerm, filterStatus } = this.state;
      const data = await WarehouseService.getAllWarehouses({ 
        page: currentPage, 
        limit: pageSize,
        search: searchTerm,
        status: filterStatus || undefined
      });
      const formattedWarehouses = data.items.map((w: any) => ({
        ...w,
        city: w.city || 'N/A',
        country: w.country || 'Việt Nam',
        capacity: w.capacity || 0,
        currentStock: w.currentStock ?? 0,
        manager: w.manager || 'Chưa cập nhật',
        status: w.status === 'ACTIVE' || w.status === 'Active' ? 'Active' : 'Inactive'
      }));
      this.setState({ warehouses: formattedWarehouses, totalItems: data.meta.totalItems });
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  async componentDidMount() {
    await this.loadWarehouses();
  }
  openModal = (warehouse: any | null = null) => {
    this.setState({
      isModalOpen: true,
      selectedWarehouse: warehouse
    });
  };
  closeModal = () => {
    this.setState({
      isModalOpen: false,
      selectedWarehouse: null
    });
  };

  openStockModal = (warehouse: any) => {
    this.setState({
      isStockModalOpen: true,
      selectedWarehouseForStock: warehouse
    });
  };

  closeStockModal = () => {
    this.setState({
      isStockModalOpen: false,
      selectedWarehouseForStock: null
    });
  };

  handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn ngừng hoạt động kho "${name}"? Kho sẽ chuyển sang trạng thái "Không hoạt động".`)) {
      try {
        await WarehouseService.deleteWarehouse(id);
        toast.success(`Đã ngừng hoạt động kho ${name}`);
        await this.loadWarehouses();
      } catch (error: any) {
        console.error('Failed to disable warehouse:', error);
        // toast now handled globally in axios.ts
      }
    }
  };

  handleSearchChange = (value: string) => {
    this.setState({ searchTerm: value, currentPage: 1 });
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadWarehouses(), 500);
  };

  handleFilterChange = (value: string) => {
    this.setState({ filterStatus: value, currentPage: 1 }, () => {
      this.loadWarehouses();
    });
  };
  
  handlePageChange = (page: number) => {
    this.setState({ currentPage: page }, () => {
      this.loadWarehouses();
    });
  };
  getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  getCapacityPercentage = (current: number, capacity: number) => {
    return Math.round(current / capacity * 100);
  };
  render() {
    const { warehouses, isModalOpen, selectedWarehouse, searchTerm, filterStatus, currentPage, pageSize, totalItems, isStockModalOpen, selectedWarehouseForStock } = this.state;
    // Server-side filtered already
    const displayWarehouses = warehouses;

    return (
      <div>
        <PageHeader 
          title="Kho hàng" 
          description="Quản lý các kho hàng và vị trí"
          actionLabel="Thêm kho"
          onAction={() => this.openModal()}
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <TableToolbar 
            searchPlaceholder="Tìm kiếm kho hàng..."
            searchValue={searchTerm}
            onSearchChange={this.handleSearchChange}
            filters={[
              { 
                label: 'Trạng thái', 
                value: filterStatus,
                onChange: this.handleFilterChange,
                options: [
                  { label: 'Tất cả trạng thái', value: '' },
                  { label: 'Hoạt động', value: 'Active' },
                  { label: 'Không hoạt động', value: 'Inactive' }
                ]
              }
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tên kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sức chứa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quản lý
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
                {displayWarehouses.map((warehouse, index) =>
                <motion.tr
                  key={warehouse.id}
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
                      <div className="font-medium text-gray-800 dark:text-white">
                        {warehouse.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {warehouse.city}, {warehouse.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {warehouse.capacity.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {warehouse.currentStock.toLocaleString()}
                        <span className="text-gray-400 ml-1">
                          (
                          {this.getCapacityPercentage(
                          warehouse.currentStock,
                          warehouse.capacity
                        )}
                          %)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {warehouse.manager}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge className={this.getStatusBadgeClass(warehouse.status)}>
                        {warehouse.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <motion.button
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mr-3"
                      title="Xem tồn kho"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => this.openStockModal(warehouse)}>
                        <Eye size={16} />
                      </motion.button>
                      <motion.button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                      title="Chỉnh sửa kho"
                      whileHover={{
                        scale: 1.2
                      }}
                      whileTap={{
                        scale: 0.9
                      }}
                      onClick={() => this.openModal(warehouse)}>

                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      title="Ngừng hoạt động"
                      whileHover={{
                        scale: 1.2
                      }}
                      whileTap={{
                        scale: 0.9
                      }}
                      onClick={() => this.handleDelete(warehouse.id, warehouse.name)}>

                        <Trash2 size={16} />
                      </motion.button>
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
            labelResults="kho"
            labelPrevious="Trước"
            labelNext="Sau"
          />
        </div>

        {isModalOpen &&
        <WarehouseModal
          isOpen={isModalOpen}
          onClose={this.closeModal}
          warehouse={selectedWarehouse}
          onSuccess={this.loadWarehouses} />
        }

        {isStockModalOpen &&
        <WarehouseStockModal
          isOpen={isStockModalOpen}
          onClose={this.closeStockModal}
          warehouse={selectedWarehouseForStock} />
        }
      </div>);

  }
}
