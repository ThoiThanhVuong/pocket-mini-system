import api from '@/lib/axios';

class AiAssistantService {
  /**
   * Send a chat message to the backend RAG Assistant
   * @param message 
   * @returns The AI response message string
   */
  async chat(message: string, threadId?: string): Promise<string> {
    const response = await api.post('/ai-assistant/chat', { message, threadId });
    
    // Backend mới trả về { success: true, data: "..." }
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data.message || 'Lỗi hệ thống';
  }

  /**
   * Get all chat threads for the current user
   */
  async getThreads(): Promise<any[]> {
    const response = await api.get('/ai-assistant/threads');
    return response.data.data || [];
  }

  /**
   * Get chat history for a specific thread
   */
  async getHistory(threadId?: string): Promise<any[]> {
    const url = threadId ? `/ai-assistant/history?threadId=${threadId}` : '/ai-assistant/history';
    const response = await api.get(url);
    return response.data.data || [];
  }

  /**
   * Clear the chat history for the current user
   */
  async clearHistory(): Promise<boolean> {
    return false; // Deprecated, use deleteThread or new thread workflow
  }

  /**
   * Delete a specific chat thread
   */
  async deleteThread(threadId: string): Promise<boolean> {
    try {
      await api.delete(`/ai-assistant/threads/${threadId}`);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa đoạn chat:', error);
      return false;
    }
  }
}

export const aiAssistantService = new AiAssistantService();
