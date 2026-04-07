import { BaseEntity } from '../base.entity';

export class AiModel extends BaseEntity {
  provider: string; // openai, local, openrouter
  model_name: string;
  type: string; // forecast, classify, chatbot
  dims?: number;
  created_at: Date;
}
