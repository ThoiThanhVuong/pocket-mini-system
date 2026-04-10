import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Let the browser set the Content-Type with boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (typeof window !== "undefined") {
      // Read token directly from cookies instead of Zustand state
      // This ensures token is available even if Zustand hasn't initialized yet
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          useAuthStore.getState().logout();
        }
      }

      // Handle other errors — NestJS validation errors return message as an array
      const rawMessage = error.response.data?.message;
      let message: string;
      if (Array.isArray(rawMessage)) {
        // Each item could be a string or an object (class-validator)
        message = rawMessage.map((m: any) => (typeof m === 'string' ? m : JSON.stringify(m))).join(', ');
      } else if (rawMessage && typeof rawMessage === 'object') {
        message = JSON.stringify(rawMessage);
      } else {
        message = rawMessage || `Lỗi ${error.response.status}: ${error.response.data?.error || 'Đã xảy ra lỗi'}`;
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        import('sonner').then(({ toast }) => {
          toast.error(error.response.data?.message || 'Bạn không có quyền thực hiện hành động này');
        });
      } else {
        // Handle all other errors globally
        import('sonner').then(({ toast }) => {
          toast.error(message);
        });
      }
      
      // Khởi tạo một Error bình thường kèm thuộc tính isAxiosError để client dễ map
      const err = new Error(message);
      (err as any).isAxiosError = true;
      (err as any).response = error.response;
      return Promise.reject(err);
    }

    // Network / timeout error
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Yêu cầu quá thời gian, vui lòng thử lại'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Không thể kết nối đến máy chủ'));
    }

    return Promise.reject(error);
  }
);

export default api;
