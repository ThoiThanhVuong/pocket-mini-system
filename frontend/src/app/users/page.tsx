"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Mail, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/common/PageHeader';
import { TableToolbar } from '@/components/common/TableToolbar';
import { Pagination } from '@/components/common/Pagination';
import { UserService } from '@/services/iam/user.service';
import { User } from '@/types/iam/user';
import { toast } from 'sonner';
import { RolesTab } from './RolesTab';
import SalaryTab from '@/components/users/SalaryTab';

const UserModal = dynamic(() => import('./UserModal').then(mod => mod.UserModal), {
  ssr: false
});

type TabType = 'users' | 'roles' | 'salary';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roles, setRoles] = useState<any[]>([]);

  // Load roles on mount
  useEffect(() => {
    import('@/services/iam/iam.service').then(({ IamService }) => {
        IamService.getAllRoles().then(setRoles).catch(console.error);
    });
  }, []);

  // Debounce search text only
  useEffect(() => {
      const timer = setTimeout(() => {
          if (activeTab === 'users') loadUsers();
      }, 500);
      return () => clearTimeout(timer);
  }, [searchText]); // Only debounce when searchText changes

  // Immediate load for filters (and activeTab)
  const isFirstRender = React.useRef(true);
  useEffect(() => {
      if (isFirstRender.current) {
          isFirstRender.current = false;
          return; // Skip because the searchText effect will run initially
      }
      if (activeTab === 'users') loadUsers();
  }, [roleFilter, statusFilter, activeTab]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.getAllUsers({
          search: searchText,
          role: roleFilter,
          status: statusFilter
      });
      setUsers(data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (user: any = null) => {
    setIsModalOpen(true);
    setSelectedUser(user);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await UserService.deleteUser(userId);
      toast.success('Xóa người dùng thành công');
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Không thể xóa người dùng');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'BANNED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'BANNED':
        return 'Tạm khóa';
      default:
        return status;
    }
  };

  const getRoleBadgeClass = (roleCode: string) => {
    switch (roleCode?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'STAFF':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleLabel = (roleCode: string) => {
    switch (roleCode?.toUpperCase()) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'MANAGER':
        return 'Quản lý';
      case 'STAFF':
        return 'Nhân viên';
      case 'VIEWER':
        return 'Người xem';
      default:
        return roleCode;
    }
  };

  const getPrimaryRole = (user: any) => {
    return user.roles && user.roles.length > 0 ? user.roles[0].roleCode : 'N/A';
  };

  return (
    <div>
      <PageHeader
        title="Người dùng & Vai trò"
        description="Quản lý người dùng và vai trò hệ thống"
        actionLabel={activeTab === 'users' ? "Thêm người dùng" : undefined}
        onAction={activeTab === 'users' ? () => openModal() : undefined}
        actionPermission="user.create"
      />

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Người dùng
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Vai trò
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'salary'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Tính lương
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'roles' ? (
        <RolesTab />
      ) : activeTab === 'salary' ? (
        <SalaryTab />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <TableToolbar
                searchPlaceholder="Tìm kiếm người dùng..."
                searchValue={searchText}
                onSearchChange={setSearchText}
                filters={[
                    { 
                        label: 'Vai trò', 
                        options: roles.map(role => ({
                            value: role.roleCode, 
                            label: role.name
                        })),
                        value: roleFilter,
                        onChange: setRoleFilter
                    }, 
                    { 
                        label: 'Trạng thái',
                         options: [
                            { value: 'active', label: 'Hoạt động' },
                            { value: 'inactive', label: 'Không hoạt động' },
                        ],
                        value: statusFilter,
                        onChange: setStatusFilter
                    }
                ]}
              />

              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách người dùng...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Người dùng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Vai trò
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Số điện thoại
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <Mail size={14} className="mr-1" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(getPrimaryRole(user))}`}>
                                <Shield size={12} className="mr-1" />
                                {getRoleLabel(getPrimaryRole(user))}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.phoneNumber || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                                {getStatusLabel(user.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openModal(user)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination totalItems={users.length} />
                </>
              )}
          </div>

          {isModalOpen && (
            <UserModal
              isOpen={isModalOpen}
              onClose={closeModal}
              user={selectedUser}
              onSuccess={loadUsers}
            />
          )}
        </>
      )}
    </div>
  );
}
