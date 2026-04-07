import { BaseEntity } from '../base.entity';

export class ChatThread extends BaseEntity {
  public userId: string;
  public title?: string;
  public modelId?: string;

  constructor(id: string, userId: string, title?: string, modelId?: string, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
    this.userId = userId;
    this.title = title;
    this.modelId = modelId;
  }
}
