import { Injectable, Logger } from '@nestjs/common';
import type { IAiProvider, IAiResponse, IAiTool } from '../../../core/interfaces/providers/ai-provider.interface';

@Injectable()
export class MockAiProvider implements IAiProvider {
  private readonly logger = new Logger(MockAiProvider.name);

  async ask(question: string): Promise<string> {
    this.logger.log(`[MockAiProvider] Received simple question: ${question}`);
    
    // Giả lập nhận diện Intent (Intent Classification)
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('tồn kho') || lowerQ.includes('còn bao nhiêu') || lowerQ.includes('sản phẩm')) {
      return 'INVENTORY';
    }
    if (lowerQ.includes('lương') || lowerQ.includes('chấm công') || lowerQ.includes('ngày công')) {
      return 'HR';
    }

    return 'UNKNOWN';
  }

  async askWithContext(context: string, question: string): Promise<string> {
    this.logger.log(`[MockAiProvider] Received question with Context.`);
    this.logger.log(`--- SYSTEM CONTEXT (RAG INJECTED) ---\n${context}\n-------------------------------------`);
    this.logger.log(`--- USER QUESTION ---\n${question}\n---------------------`);

    // Trả về trực tiếp Context (Dữ liệu RAG) để UI hiển thị cho đẹp
    return context;
  }

  async askWithTools(question: string, tools: IAiTool[]): Promise<IAiResponse> {
    this.logger.log(`[MockAiProvider] Function calling... (mocked)`);
    return { message: 'Công cụ chưa được giả lập.', functionCall: undefined };
  }
}
