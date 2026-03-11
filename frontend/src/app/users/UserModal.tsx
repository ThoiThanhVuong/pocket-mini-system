'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { User } from '@/types/iam/user';
import { UserService } from '@/services/iam/user.service';
import { IamService } from '@/services/iam/iam.service';
import { Role } from '@/types/iam/role';
import { WarehouseService } from '@/services/inventory/warehouse.service';
import { Warehouse } from '@/types/inventory/warehouse';
import { toast } from 'sonner';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    roleCode: user?.roles?.[0]?.roleCode || 'STAFF', 
    phone: user?.phoneNumber || '',
    baseSalary: user?.baseSalary || 0,
    salaryType: (user?.salaryType as 'MONTHLY' | 'HOURLY') || 'MONTHLY',
    status: user?.status || 'active',
    warehouseIds: user?.warehouseIds || []
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    loadRoles();
    loadWarehouses();
    if (user) {
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            roleCode: user.roles?.[0]?.roleCode || '', 
            phone: user.phoneNumber || '',
            baseSalary: user.baseSalary || 0,
            salaryType: (user.salaryType as 'MONTHLY' | 'HOURLY') || 'MONTHLY',
            status: user.status,
            warehouseIds: user.warehouseIds || []
        });
    }
  }, [user]);

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const data = await IamService.getAllRoles();
      setRoles(data);
      if (data.length > 0 && !formData.roleCode && !user) {
        setFormData(prev => ({ ...prev, roleCode: data[0].roleCode }));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Không thể tải danh sách vai trò');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadWarehouses = async () => {
    setIsLoadingWarehouses(true);
    try {
      const data = await WarehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (user && formData.password && formData.password.length < 6) {
       toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
       return;
    }

    setIsSubmitting(true);

    try {
      if (user) {
        const updateData: any = {
           fullName: formData.fullName,
           phoneNumber: formData.phone,
           roleCode: formData.roleCode,
           baseSalary: formData.baseSalary,
           salaryType: formData.salaryType,
           status: formData.status,
           warehouseIds: formData.warehouseIds
        };
        if (formData.password) {
            updateData.password = formData.password;
        }

        await UserService.updateUser(user.id, updateData);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await UserService.createUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          roleCode: formData.roleCode,
          baseSalary: formData.baseSalary,
          salaryType: formData.salaryType,
          warehouseIds: formData.warehouseIds
        });
        toast.success('Tạo người dùng mới thành công');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const message = error.message || 'Có lỗi xảy ra khi lưu người dùng';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  required
                />
                {isEditMode && (
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                )}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu {isEditMode ? '(Để trống nếu không đổi)' : <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required={!isEditMode}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
              </div>
              
              {/* Role block - Always show */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  {isLoadingRoles ? (
                    <div className="text-sm text-gray-500 py-2">Đang tải vai trò...</div>
                  ) : (
                    <select
                      name="roleCode"
                      value={formData.roleCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Chọn vai trò</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.roleCode}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Vai trò xác định quyền hạn của người dùng
                  </p>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kho phụ trách
                </label>
                {isLoadingWarehouses ? (
                  <div className="text-sm text-gray-500 py-2">Đang tải danh sách kho...</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-md">
                    {warehouses.map(wh => (
                      <label key={wh.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.warehouseIds.includes(wh.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, warehouseIds: [...prev.warehouseIds, wh.id] }));
                            } else {
                              setFormData(prev => ({ ...prev, warehouseIds: prev.warehouseIds.filter(id => id !== wh.id) }));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{wh.name}</span>
                      </label>
                    ))}
                    {warehouses.length === 0 && <span className="text-sm text-gray-500">Chưa có kho nào</span>}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                   <Eye size={12} />
                   <span>Admin sẽ tự động được gán quyền xem tất cả kho</span>
                </p>
              </div>
              
              {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="banned">Bị khóa</option>
                    </select>
                  </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}