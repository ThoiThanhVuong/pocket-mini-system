import api from '@/lib/axios';
import { CreateUserInput, UpdateUserInput, User } from '@/types/iam/user';
import { ApiResponse, PaginatedResult } from '@/types/common/api';


export const UserService = {
  async createUser(data: CreateUserInput): Promise<User> {
    const response = await api.post<ApiResponse<User>>(`/iam/users`, data);
    return response.data.data;
  },

  async getAllUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedResult<User>> {
    const response = await api.get<ApiResponse<PaginatedResult<User>>>(`/iam/users`, { params });
    return response.data.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/iam/users/${userId}`);
    return response.data.data;
  },

  async updateUser(userId: string, data: UpdateUserInput): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/iam/users/${userId}`, data);
    return response.data.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/iam/users/${userId}`);
  },

  async assignRole(userId: string, roleCode: string): Promise<void> {
    await api.post(
      `/iam/users/${userId}/roles/${roleCode}`,
      {},
    );
  },

  async removeRole(userId: string, roleCode: string): Promise<void> {
    await api.delete(`/iam/users/${userId}/roles/${roleCode}`);
  },
};
