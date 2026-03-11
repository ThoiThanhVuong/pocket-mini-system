'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { IamService } from '@/services/iam/iam.service';
import { Role } from '@/types/iam/role';
import { toast } from 'sonner';
import { RoleModal } from './RoleModal';

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await IamService.getAllRoles();
      setRoles(data);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error('Không thể tải danh sách vai trò');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);


  const handleDelete = async (roleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      return;
    }
    try {
      await IamService.deleteRole(roleId);
      toast.success('Xóa vai trò thành công');
      loadRoles();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error('Không thể xóa vai trò');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách vai trò...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Quản lý vai trò và quyền hạn hệ thống
        </p>
        <button
          onClick={() => {
            setSelectedRole(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tạo vai trò
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {roles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Không tìm thấy vai trò nào
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {roles.map((role, index) => (
              <motion.div
                key={role.id || `role-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                      className="mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {expandedRoleId === role.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-medium text-gray-800 dark:text-white">{role.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                          {role.roleCode}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                      {role.permissions?.length || 0} quyền 
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {expandedRoleId === role.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quyền hạn:</h4>
                    {!role.permissions || role.permissions.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có quyền nào được gán</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {role.permissions.map((perm, pIndex) => (
                          <div key={perm.id || `perm-${pIndex}`} className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                            {perm.permissionCode}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          onSuccess={loadRoles}
        />
      )}
    </div>
  );
}
