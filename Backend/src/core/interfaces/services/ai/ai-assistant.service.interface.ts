export const IAiAssistantServiceKey = 'IAiAssistantService';

export interface IAiAssistantService {
  handleChat(userId: string, message: string, threadId?: string): Promise<string>;
  getChatHistory(userId: string, threadId?: string): Promise<any[]>;
  getUserThreads(userId: string): Promise<any[]>;
  deleteThread(userId: string, threadId: string): Promise<void>;
}
