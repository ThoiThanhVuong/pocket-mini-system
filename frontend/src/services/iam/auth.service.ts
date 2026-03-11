import api from '@/lib/axios';
import { LoginInput } from '@/lib/validations/auth';
import { LoginResponse } from '@/types/iam/user';
import { ApiResponse } from '@/types/common/api';


export const AuthService = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data.data; // Access nested data property
  },

  logout: async () => {
    return await api.post('/auth/logout')
  },
  
  getProfile: async (token: string) => {
     const response = await api.get<ApiResponse<any>>('/auth/profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
     });
     return response.data.data; // Access nested data property
  }
};
