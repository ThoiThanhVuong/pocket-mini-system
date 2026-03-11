import api from '@/lib/axios';
import { Role, Permission, CreateRoleInput, UpdateRoleInput } from '@/types/iam/role';
import { User, UpdateProfileInput } from '@/types/iam/user';
import { ApiResponse } from '@/types/common/api';

export const IamService = {
  // Role Management
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get<ApiResponse<Role[]>>(`/iam/roles`);
    return response.data.data;
  },

  async getRoleById(roleId: string): Promise<Role> {
    const response = await api.get<ApiResponse<Role>>(`/iam/roles/${roleId}`);
    return response.data.data;
  },

  async createRole(data: CreateRoleInput): Promise<Role> {
    const response = await api.post<ApiResponse<Role>>(`/iam/roles`, data);
    return response.data.data;
  },

  async updateRole(roleId: string, data: UpdateRoleInput): Promise<Role> {
    const response = await api.put<ApiResponse<Role>>(`/iam/roles/${roleId}`, data);
    return response.data.data;
  },

  async deleteRole(roleId: string): Promise<void> {
    await api.delete(`/iam/roles/${roleId}`);
  },

  // Permission Management
  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(`/iam/permissions`);
    return response.data.data;
  },

  async assignPermissionToRole(roleId: string, permissionCode: string): Promise<void> {
    await api.post(`/iam/roles/${roleId}/permissions/${permissionCode}`, {});
  },

  async removePermissionFromRole(roleId: string, permissionCode: string): Promise<void> {
    await api.delete(`/iam/roles/${roleId}/permissions/${permissionCode}`);
  },

  // Profile (Self)
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/iam/profile`);
    return response.data.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/iam/profile`, data);
    return response.data.data;
  }
};
