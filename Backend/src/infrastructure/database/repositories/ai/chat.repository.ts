import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatThreadEntity } from '../../entities/ai/chat-thread.entity';
import { ChatMessageEntity } from '../../entities/ai/chat-message.entity';
import { IChatRepository } from '../../../../core/interfaces/repositories/ai/chat.repository.interface';

@Injectable()
export class ChatRepository implements IChatRepository {
  constructor(
    @InjectRepository(ChatThreadEntity)
    private readonly threadRepo: Repository<ChatThreadEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
  ) {}

  async findOrCreateThread(userId: string, modelName: string, threadId?: string, title?: string): Promise<any> {
    let thread: ChatThreadEntity | null = null;
    if (threadId) {
      thread = await this.threadRepo.findOne({
        where: { id: threadId, userId },
      });
    }

    if (!thread) {
      thread = this.threadRepo.create({
        userId,
        // Dùng title truyền vào hoặc lấy 30 ký tự đầu tiên của message (AI Service sẽ lo phần title)
        title: title || 'Cuộc trò chuyện mới',
      });
      await this.threadRepo.save(thread);
    }

    return thread;
  }

  async saveMessage(threadId: string, userId: string, role: string, content: string): Promise<any> {
    const message = this.messageRepo.create({
      threadId,
      userId: role === 'user' ? userId : undefined,
      role,
      content,
    });
    return await this.messageRepo.save(message);
  }

  async getMessagesByThread(threadId: string): Promise<any[]> {
    return await this.messageRepo.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
    });
  }

  async getLatestThreadByUser(userId: string): Promise<any | null> {
    return await this.threadRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async clearUserHistory(userId: string): Promise<void> {
    // Xóa tất cả các thread của user. Do đã có CASCADING delete ở DB/Entity, messages thuộc thread sẽ tự động bị xóa.
    // Hoặc ta có thể xóa message bằng cách tìm tất cả threads và xóa messages của nó.
    // Nếu thiết lập onDelete: 'CASCADE' đã hoạt động tốt, chỉ cần xóa threads:
    const threads = await this.threadRepo.find({ where: { userId } });
    if (threads.length > 0) {
      await this.threadRepo.remove(threads);
    }
  }

  async deleteOldMessages(days: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // TypeORM query builder để xóa hàng loạt dựa trên thời gian
    await this.messageRepo
      .createQueryBuilder()
      .delete()
      .from(ChatMessageEntity)
      .where("createdAt < :cutoffDate", { cutoffDate })
      .execute();
  }

  async getUserThreads(userId: string): Promise<any[]> {
    return await this.threadRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async deleteThread(userId: string, threadId: string): Promise<void> {
    // Nhờ onDelete: CASCADE, xóa thread sẽ tự xóa messages
    await this.threadRepo.delete({ id: threadId, userId });
  }
}
