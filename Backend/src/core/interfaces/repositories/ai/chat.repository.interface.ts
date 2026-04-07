import { ChatThread } from '../../../domain/entities/ai/chat-thread.entity';
import { ChatMessage } from '../../../domain/entities/ai/chat-message.entity';

export interface IChatRepository {
  findOrCreateThread(userId: string, modelName: string, threadId?: string, title?: string): Promise<ChatThread>;
  saveMessage(threadId: string, userId: string, role: string, content: string): Promise<ChatMessage>;
  getMessagesByThread(threadId: string): Promise<ChatMessage[]>;
  getLatestThreadByUser(userId: string): Promise<ChatThread | null>;
  clearUserHistory(userId: string): Promise<void>;
  deleteOldMessages(days: number): Promise<void>;
  getUserThreads(userId: string): Promise<ChatThread[]>;
  deleteThread(userId: string, threadId: string): Promise<void>;
}

