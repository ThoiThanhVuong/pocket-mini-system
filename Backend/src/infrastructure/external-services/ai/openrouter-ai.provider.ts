import { Injectable, Logger } from '@nestjs/common';
import type { IAiProvider, IAiResponse, IAiTool, IAiMessage } from '../../../core/interfaces/providers/ai-provider.interface';

@Injectable()
export class OpenRouterAiProvider implements IAiProvider {
  private readonly logger = new Logger(OpenRouterAiProvider.name);
  private apiKey: string;
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('WARNING: OPENROUTER_API_KEY is not set in environment variables!');
    }
  }

  private async callOpenRouter(systemInstruction: string, userText: string, history: IAiMessage[] = []): Promise<string> {
    if (!this.apiKey) {
      return '(Lỗi: Chưa cấu hình OPENROUTER_API_KEY trong file .env)';
    }

    const payload = {
      model: 'google/gemini-2.0-flash-001', 
      messages: [
        { role: 'system', content: systemInstruction },
        ...history,
        { role: 'user', content: userText }
      ],
      temperature: 0.3,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.error) {
         this.logger.error('OpenRouter API Error:', data.error);
         return `(Lỗi từ OpenRouter: ${data.error.message})`;
      }
      return data.choices[0].message.content;
    } catch (error) {
      this.logger.error('OpenRouter Request Failed:', error);
      return '(Lỗi kết nối tới trạm OpenRouter)';
    }
  }

  async ask(question: string, history?: IAiMessage[]): Promise<string> {
    this.logger.log(`[OpenRouterAiProvider] Classifying Intent for: ${question}`);
    const systemPrompt = `Phân loại câu hỏi người dùng thành: INVENTORY, HR, hoặc UNKNOWN. CHỈ TRẢ VỀ 1 TỪ KHÓA DUY NHẤT.`;
    
    let intent = await this.callOpenRouter(systemPrompt, question, history);
    intent = intent.trim().toUpperCase();
    
    if (['INVENTORY', 'HR', 'UNKNOWN'].includes(intent)) return intent;
    if (intent.includes('INVENTORY')) return 'INVENTORY';
    if (intent.includes('HR')) return 'HR';
    return 'UNKNOWN';
  }

  async askWithContext(context: string, question: string, history?: IAiMessage[]): Promise<string> {
    this.logger.log(`[OpenRouterAiProvider] Generating response with RAG Context.`);
    const systemPrompt = `Bạn là "Chuyên gia điều phối kho" thông minh của Pocket Mini System. 
      DỮ LIỆU HỆ THỐNG HIỆN TẠI (RAG):
      """
      ${context}
      """
      NHIỆM VỤ: Trả lời câu hỏi dựa trên dữ liệu trên. 
      YÊU CẦU: 
      1. Trả lời quyết đoán, chính xác, lễ phép (Dạ, thưa). 
      2. KHÔNG dùng định dạng văn bản như ** (in đậm) hay * (in nghiêng) trong câu trả lời. Hãy viết văn xuôi tự nhiên.
      3. Luôn ưu tiên dùng dữ liệu hệ thống để giải đáp thay vì hỏi ngược lại người dùng. 
      4. Nếu dữ liệu cho thấy tồn kho bằng 0 nhưng sản phẩm có trong danh mục, hãy khẳng định sản phẩm tồn tại và có thể nhập hàng.
      5. QUYỀN TRUY CẬP KHO: Nếu sếp hỏi về một kho KHÔNG có tên trong "DANH SÁCH KHO HÀNG ĐANG CÓ", hãy trả lời: "Dạ, hiện tại tài khoản của anh/chị chưa được cấp quyền truy cập vào kho này ạ."`;

    return await this.callOpenRouter(systemPrompt, question, history);
  }

  async askWithTools(question: string, tools: IAiTool[], history: IAiMessage[] = [], systemContext?: string): Promise<IAiResponse> {
    if (!this.apiKey) {
      return { message: '(Lỗi: Chưa cấu hình OPENROUTER_API_KEY)', functionCall: undefined };
    }

    const messages: any[] = [
      { 
        role: 'system', 
        content: `Bạn là "Trợ lý Điều hành" thông minh và tinh tế của Pocket Mini System.
    TƯ DUY & PHONG CÁCH PHẢN HỒI:
    1. LUÔN LẮNG NGHE & GHÉP NỐI: Phải luôn nhìn vào "LỊCH SỬ CHAT" bên dưới để hiểu ngữ cảnh. Nếu sếp đưa thông tin rải rác qua từng câu (ví dụ: câu trước đưa Tên, câu này đưa SĐT), hãy TỰ ĐỘNG GOM LẠI để thực hiện lệnh.
    2. XỬ LÝ LINH HOẠT: Sếp có thể nhập thông tin bất kỳ thứ tự nào. Nhiệm vụ của bạn là nhặt nhạnh các mảnh ghép đó từ lịch sử để gọi đúng tool ngay khi đủ thông tin yêu cầu.
    3. MỘT KHI ĐÃ GỌI LỆNH TẠO MỚI (Khách hàng/Nhà cung cấp): Khi thiếu thông tin, bạn PHẢI HỎI và LIỆT KÊ RÕ cho sếp biết đâu là "Thông tin bắt buộc" (VD: Tên, Số điện thoại) và đâu là "Thông tin tùy chọn" (VD: Email, Địa chỉ) để sếp dễ nắm bắt.
    4. QUY TẮC CỐT LÕI (CỰC KỲ QUAN TRỌNG): 
    - NẾU sếp nhờ tạo khách hàng, thêm nhà cung cấp, hoặc tạo phiếu nhập/xuất kho: BẠN BẮT BUỘC PHẢI DÙNG FUNCTION CALL (Gọi Tool tương ứng) để thực thi.
    - TUYỆT ĐỐI KHÔNG BAO GIỜ được trả lời bằng văn bản xác nhận kiểu "Em đã tạo khách hàng thành công" mà KHÔNG GỌI TOOL. Việc phản hồi văn xuôi nói rằng "Đã làm xong" nhưng không thực sự gọi hàm hệ thống là LỖI NGHIÊM TRỌNG.
    - Nếu đã đủ các trường bắt buộc, PHẢI EMIT JSON TOOL CALL NGAY LẬP TỨC (không cần chờ nhập các trường tùy chọn).
    5. KHÔNG DÙNG ĐỊNH DẠNG RƯỜM RÀ: Tuyệt đối KHÔNG dùng các ký tự đánh dấu như ** (in đậm), * (in nghiêng) hay dấu gạch đầu dòng trong các câu văn xuôi khi chat giao tiếp bình thường.
    6. TRÌNH BÀY BẢNG BIỂU: Chỉ khi nào cần liệt kê danh sách hoặc báo cáo số liệu thì mới dùng định dạng BẢNG (Markdown Table).
    7. TÁC PHONG: Luôn duy trì thái độ lễ phép (Dạ, thưa), chuyên nghiệp.` 
      }
    ];

    // Nếu có System Context (RAG), đưa vào như một System Message thứ 2
    if (systemContext) {
      messages.push({
        role: 'system',
        content: `DỮ LIỆU HỆ THỐNG HIỆN TẠI (Để tham khảo khi thực hiện lệnh):\n"""\n${systemContext}\n"""`
      });
    }

    // Thêm lịch sử chat
    messages.push(...history);

    // Thêm câu hỏi hiện tại của User
    messages.push({ role: 'user', content: question });

    const payload = {
      model: 'google/gemini-2.0-flash-001',
      messages,
      tools: tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      })),
      tool_choice: 'auto',
      temperature: 0.1, 
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      this.logger.log(`[OpenRouter Debug] Raw payload sent tools: ${tools.map(t => t.name).join(', ')}`);
      this.logger.log(`[OpenRouter Debug] Raw response: ${JSON.stringify(data.choices?.[0]?.message || data)}`);

      if (data.error) {
         return { message: `(Lỗi API: ${data.error.message})`, functionCall: undefined };
      }

      const choice = data.choices[0].message;
      
      // Hỗ trợ cả hai định dạng: tool_calls (mới) và function_call (cũ)
      if (choice.tool_calls && choice.tool_calls.length > 0) {
        const toolCall = choice.tool_calls[0].function;
        return {
          message: choice.content || 'Đang thực hiện yêu cầu...',
          functionCall: {
            name: toolCall.name,
            args: JSON.parse(toolCall.arguments)
          }
        };
      } else if (choice.function_call) {
        return {
          message: choice.content || 'Đang thực hiện yêu cầu...',
          functionCall: {
            name: choice.function_call.name,
            args: JSON.parse(choice.function_call.arguments)
          }
        };
      }

      return { message: choice.content, functionCall: undefined };
    } catch (error) {
      this.logger.error('OpenRouter Tools Request Failed:', error);
      return { message: '(Lỗi kết nối AI)', functionCall: undefined };
    }
  }
}
