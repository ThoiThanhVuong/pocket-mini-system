import { BaseEntity } from '../base.entity';

export class ChatMessage extends BaseEntity {
  public threadId: string;
  public userId?: string;
  public role: string; // system, user, assistant
  public content: string;

  constructor(id: string, threadId: string, role: string, content: string, userId?: string, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
    this.threadId = threadId;
    this.role = role;
    this.content = content;
    this.userId = userId;
  }
}
