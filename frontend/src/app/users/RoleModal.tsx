'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Role, Permission } from '@/types/iam/role';
import { IamService } from '@/services/iam/iam.service';
import { toast } from 'sonner';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess?: () => void;
}

export function RoleModal({ isOpen, onClose, role, onSuccess }: RoleModalProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    baseSalary: role?.baseSalary || 0,
    salaryType: role?.salaryType || 'MONTHLY'
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role?.permissions.map(p => p.permissionCode) || [])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        baseSalary: role.baseSalary || 0,
        salaryType: role.salaryType || 'MONTHLY'
      });
      setSelectedPermissions(new Set(role.permissions.map(p => p.permissionCode)));
    }
  }, [role]);

  const loadPermissions = async () => {
    try {
      const data = await IamService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Không thể tải danh sách quyền hạn');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const togglePermission = (permissionCode: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionCode)) {
      newSelected.delete(permissionCode);
    } else {
      newSelected.add(permissionCode);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Tên vai trò không được để trống');
      return;
    }

    setIsSubmitting(true);

    try {
      let savedRole: Role;

      if (role) {
        savedRole = await IamService.updateRole(role.id, formData);
      } else {
        savedRole = await IamService.createRole(formData);
      }

      const currentPermissions = new Set(role?.permissions.map(p => p.permissionCode) || []);
      
      for (const permCode of selectedPermissions) {
        if (!currentPermissions.has(permCode)) {
          await IamService.assignPermissionToRole(savedRole.id, permCode);
        }
      }

      for (const permCode of currentPermissions) {
        if (!selectedPermissions.has(permCode)) {
          await IamService.removePermissionFromRole(savedRole.id, permCode);
        }
      }

      toast.success(role ? 'Cập nhật vai trò thành công' : 'Tạo vai trò thành công');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving role:', error);
      const message = error.message || 'Có lỗi xảy ra khi lưu vai trò';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const prefix = perm.permissionCode.split('.')[0] || 'OTHER';
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

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
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {role ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
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
                  Tên vai trò <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại lương
                </label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as 'MONTHLY' | 'HOURLY' })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="MONTHLY">Lương tháng</option>
                  <option value="HOURLY">Lương theo giờ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formData.salaryType === 'HOURLY' ? 'Lương theo giờ (VNĐ)' : 'Lương cơ bản (VNĐ)'}
                </label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quyền hạn ({selectedPermissions.size} đã chọn)
                </label>
                {isLoadingPermissions ? (
                  <div className="py-4 text-center text-gray-500">Đang tải quyền hạn...</div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-md max-h-64 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                      <div key={module} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                          {module}
                        </div>
                        <div className="p-2 space-y-1">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.has(perm.permissionCode)}
                                onChange={() => togglePermission(perm.permissionCode)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {perm.permissionCode}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  {isSubmitting ? 'Đang xử lý...' : role ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
