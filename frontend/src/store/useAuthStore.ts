import { create } from 'zustand';
import Cookies from 'js-cookie';
import { AuthService } from '@/services/iam/auth.service';
import { LoginInput } from '@/lib/validations/auth';
import { LoginResponse } from '@/types/iam/user';

interface AuthState {
  user: LoginResponse['user'] | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginInput) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  login: async (data: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(data);
      const { accessToken, user } = response;

      // Save token to cookie for Middleware
      const oneHour = 1/24;
      Cookies.set('accessToken', accessToken, { expires: oneHour }); // 1 hour
      Cookies.set('user', JSON.stringify(user), { expires: oneHour }); // 1 hour

      set({ 
        accessToken, 
        user, 
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      console.error('Login Failed:', error);
      set({ 
        isLoading: false, 
        error: error.message || 'Đăng nhập thất bại' 
      });
      return false;
    }
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('user');
    set({ user: null, accessToken: null });
    window.location.href = '/login';
  },

  initialize: () => {
      const token = Cookies.get('accessToken');
      const userStr = Cookies.get('user');
      if (token) {
          set({ accessToken: token });
          if (userStr) {
             try {
                 set({ user: JSON.parse(userStr) });
             } catch (e) {
                 console.error("Failed to parse user cookie", e);
             }
          }
      }
  }
}));
