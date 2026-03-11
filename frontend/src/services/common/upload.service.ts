import api from '@/lib/axios';
import { ApiResponse } from '@/types/common/api';

export const UploadService = {
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // TransformInterceptor wraps all responses: { success, message, data: { url } }
    return response.data.data.url;
  }
};
