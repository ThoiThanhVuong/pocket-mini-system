import React, { Component } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { Warehouse } from '@/types/inventory/warehouse';
import { WarehouseService } from '@/services/inventory/warehouse.service';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
  onSuccess?: () => void;
}

interface WarehouseModalState {
  name: string;
  location: string;
  city: string;
  country: string;
  capacity: number;
  manager: string;
  contactInfo: string;
  status: string;
  isSubmitting: boolean;
}

export class WarehouseModal extends Component<WarehouseModalProps, WarehouseModalState> {
  constructor(props: WarehouseModalProps) {
    super(props);
    const { warehouse } = props;
    this.state = {
      name: warehouse?.name || '',
      location: warehouse?.location || '',
      city: warehouse?.city || '',
      country: warehouse?.country || '',
      capacity: warehouse?.capacity || 0,
      manager: warehouse?.manager || '',
      contactInfo: warehouse?.contactInfo || '',
      status: warehouse?.status || 'Active',
      isSubmitting: false
    };
  }

  componentDidUpdate(prevProps: WarehouseModalProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const { warehouse } = this.props;
      this.setState({
        name: warehouse?.name || '',
        location: warehouse?.location || '',
        city: warehouse?.city || '',
        country: warehouse?.country || '',
        capacity: warehouse?.capacity || 0,
        manager: warehouse?.manager || '',
        contactInfo: warehouse?.contactInfo || '',
        status: warehouse?.status || 'Active',
        isSubmitting: false
      });
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    this.setState({ [id]: id === 'capacity' ? parseInt(value) || 0 : value } as any);
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ isSubmitting: true });

    try {
      const { name, location, city, country, capacity, manager, contactInfo, status } = this.state;
      const data = { name, location, city, country, capacity, manager, contactInfo, status };

      if (this.props.warehouse) {
        await WarehouseService.updateWarehouse(this.props.warehouse.id, data);
      } else {
        await WarehouseService.createWarehouse(data);
      }

      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
      this.props.onClose();
    } catch (error) {
      console.error('Failed to save warehouse:', error);
      // Here you could add a toast notification for error
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { isOpen, onClose, warehouse } = this.props;
    const isEditing = !!warehouse;
    const modalVariants: Variants = {
      hidden: {
        opacity: 0,
        scale: 0.8
      },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          duration: 0.5,
          bounce: 0.4
        }
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
          duration: 0.2
        }
      }
    };
    const backdropVariants: Variants = {
      hidden: {
        opacity: 0
      },
      visible: {
        opacity: 1
      },
      exit: {
        opacity: 0
      }
    };
    return (
      <AnimatePresence>
        {isOpen &&
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose} />

            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto z-10"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}>

                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {isEditing ? 'Chỉnh sửa kho' : 'Thêm kho mới'}
                  </h2>
                  <motion.button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  whileHover={{
                    scale: 1.1
                  }}
                  whileTap={{
                    scale: 0.9
                  }}
                  onClick={onClose}>

                    <X size={20} />
                  </motion.button>
                </div>

                <div className="p-6">
                  <form onSubmit={this.handleSubmit}>
                    <div className="mb-4">
                      <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                        Tên kho
                      </label>
                      <input
                      type="text"
                      id="name"
                      required
                      value={this.state.name}
                      onChange={this.handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Nhập tên kho" />

                    </div>

                    <div className="mb-4">
                      <label
                      htmlFor="location"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                        Địa chỉ
                      </label>
                      <input
                      type="text"
                      id="location"
                      required
                      value={this.state.location}
                      onChange={this.handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Nhập địa chỉ" />

                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                        htmlFor="city"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                          Thành phố
                        </label>
                        <input
                        type="text"
                        id="city"
                        value={this.state.city}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Thành phố" />

                      </div>
                      <div>
                        <label
                        htmlFor="country"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                          Quốc gia
                        </label>
                        <input
                        type="text"
                        id="country"
                        value={this.state.country}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Quốc gia" />

                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                        htmlFor="capacity"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                          Sức chứa
                        </label>
                        <input
                        type="number"
                        id="capacity"
                        min="0"
                        value={this.state.capacity}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0" />

                      </div>
                      <div>
                        <label
                        htmlFor="status"
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                          Trạng thái
                        </label>
                        <select
                        id="status"
                        value={this.state.status}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">

                          <option value="">Chọn trạng thái</option>
                          <option value="Active">Hoạt động</option>
                          <option value="Inactive">Không hoạt động</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                      htmlFor="manager"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                        Quản lý
                      </label>
                      <input
                      type="text"
                      id="manager"
                      value={this.state.manager}
                      onChange={this.handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Tên quản lý" />

                    </div>

                    <div className="mb-4">
                      <label
                      htmlFor="contactInfo"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                        Thông tin liên hệ
                      </label>
                      <input
                      type="text"
                      id="contactInfo"
                      value={this.state.contactInfo}
                      onChange={this.handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Số điện thoại hoặc email" />

                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <motion.button
                      type="button"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      whileHover={{
                        scale: 1.05
                      }}
                      whileTap={{
                        scale: 0.95
                      }}
                      onClick={onClose}>

                        Hủy
                      </motion.button>
                      <motion.button
                      type="submit"
                      disabled={this.state.isSubmitting}
                      className={`px-4 py-2 text-white rounded-md ${this.state.isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                      whileHover={{
                        scale: this.state.isSubmitting ? 1 : 1.05
                      }}
                      whileTap={{
                        scale: this.state.isSubmitting ? 1 : 0.95
                      }}>

                        {this.state.isSubmitting ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm kho')}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        }
      </AnimatePresence>);

  }
}