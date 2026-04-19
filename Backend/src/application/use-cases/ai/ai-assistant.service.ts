import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IAiAssistantService } from '../../../core/interfaces/services/ai/ai-assistant.service.interface';
import { IAiProviderKey, IAiTool, IAiMessage } from '../../../core/interfaces/providers/ai-provider.interface';
import type { IAiProvider } from '../../../core/interfaces/providers/ai-provider.interface';
import type { IStockRepository } from '../../../core/interfaces/repositories/inventory/stock.repository.interface';
import type { IProductRepository } from '../../../core/interfaces/repositories/inventory/product.repository.interface';
import type { IChatRepository } from '../../../core/interfaces/repositories/ai/chat.repository.interface';
import type { IStockInService } from '../../../core/interfaces/services/inventory/stock-in.service.interface';
import { IStockInServiceKey } from '../../../core/interfaces/services/inventory/stock-in.service.interface';
import type { IStockOutService } from '../../../core/interfaces/services/inventory/stock-out.service.interface';
import { IStockOutServiceKey } from '../../../core/interfaces/services/inventory/stock-out.service.interface';
import type { IStockTransferService } from '../../../core/interfaces/services/inventory/stock-transfer.service.interface';
import { IStockTransferServiceKey } from '../../../core/interfaces/services/inventory/stock-transfer.service.interface';
import type { ISupplierService } from '../../../core/interfaces/services/partners/supplier.service.interface';
import { ISupplierServiceKey } from '../../../core/interfaces/services/partners/supplier.service.interface';
import type { ICustomerService } from '../../../core/interfaces/services/partners/customer.service.interface';
import { ICustomerServiceKey } from '../../../core/interfaces/services/partners/customer.service.interface';
import type { IWarehouseService } from '../../../core/interfaces/services/inventory/warehouse.service.interface';
import { IWarehouseServiceKey } from '../../../core/interfaces/services/inventory/warehouse.service.interface';
import type { IReportService } from '../../../core/interfaces/services/system/report.service.interface';
import { IReportServiceKey } from '../../../core/interfaces/services/system/report.service.interface';
import type { IAttendanceService } from '../../../core/interfaces/services/hrm/attendance.service.interface';
import { AttendanceServiceKey } from '../../../core/interfaces/services/hrm/attendance.service.interface';
import type { IPayrollService } from '../../../core/interfaces/services/hrm/payroll.service.interface';
import { PayrollServiceKey } from '../../../core/interfaces/services/hrm/payroll.service.interface';

@Injectable()
export class AiAssistantService implements IAiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  private readonly tools: IAiTool[] = [
    {
      name: 'create_stock_in_slip',
      description: 'Tạo phiếu nhập kho cho một hoặc nhiều sản phẩm từ nhà cung cấp',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productName: { type: 'string', description: 'Tên hoặc từ khóa sản phẩm' },
                quantity: { type: 'number', description: 'Số lượng nhập' },
                price: { type: 'number', description: 'Giá nhập (Tùy chọn. Nếu không có sẽ tự động lấy giá từ danh mục hàng hóa)' }
              },
              required: ['productName', 'quantity']
            }
          },
          supplierName: { type: 'string', description: 'Tên nhà cung cấp' },
          warehouseName: { type: 'string', description: 'Tên kho (mặc định là Kho chính)' }
        },
        required: ['items', 'supplierName']
      }
    },
    {
      name: 'create_stock_out_slip',
      description: 'Tạo phiếu xuất kho cho một hoặc nhiều sản phẩm cho khách hàng',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productName: { type: 'string', description: 'Tên hoặc từ khóa sản phẩm' },
                quantity: { type: 'number', description: 'Số lượng xuất' },
                price: { type: 'number', description: 'Giá bán (Tùy chọn. Nếu không có sẽ tự động lấy giá từ danh mục hàng hóa)' }
              },
              required: ['productName', 'quantity']
            }
          },
          customerName: { type: 'string', description: 'Tên khách hàng' },
          warehouseName: { type: 'string', description: 'Tên kho xuất hàng' }
        },
        required: ['items', 'customerName']
      }
    },
    {
      name: 'create_stock_transfer_slip',
      description: 'Tạo phiếu chuyển kho giữa các kho hàng nội bộ',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productName: { type: 'string', description: 'Tên hoặc từ khóa sản phẩm' },
                quantity: { type: 'number', description: 'Số lượng chuyển' }
              },
              required: ['productName', 'quantity']
            }
          },
          fromWarehouseName: { type: 'string', description: 'Tên kho đi' },
          toWarehouseName: { type: 'string', description: 'Tên kho đến' }
        },
        required: ['items', 'fromWarehouseName', 'toWarehouseName']
      }
    },
    {
        name: 'create_customer',
        description: 'Thêm khách hàng mới vào hệ thống',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Họ tên khách hàng' },
            phone: { type: 'string', description: 'Số điện thoại' },
            email: { type: 'string', description: 'Email' },
            address: { type: 'string', description: 'Địa chỉ' }
          },
          required: ['name', 'phone']
        }
    },
    {
        name: 'create_supplier',
        description: 'Thêm nhà cung cấp mới vào hệ thống',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Tên nhà cung cấp/Công ty' },
            phone: { type: 'string', description: 'Số điện thoại liên hệ' },
            email: { type: 'string', description: 'Email liên hệ' },
            address: { type: 'string', description: 'Địa chỉ trụ sở' }
          },
          required: ['name', 'phone']
        }
    }
  ];

  constructor(
    @Inject(IAiProviderKey) private readonly aiProvider: IAiProvider,
    @Inject('IStockRepository') private readonly stockRepo: IStockRepository,
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
    @Inject('IChatRepository') private readonly chatRepo: IChatRepository,
    @Inject(IStockInServiceKey) private readonly stockInService: IStockInService,
    @Inject(IStockOutServiceKey) private readonly stockOutService: IStockOutService,
    @Inject(IStockTransferServiceKey) private readonly stockTransferService: IStockTransferService,
    @Inject(ISupplierServiceKey) private readonly supplierService: ISupplierService,
    @Inject(ICustomerServiceKey) private readonly customerService: ICustomerService,
    @Inject(IWarehouseServiceKey) private readonly warehouseService: IWarehouseService,
    @Inject(IReportServiceKey) private readonly reportService: IReportService,
    @Inject(AttendanceServiceKey) private readonly attendanceService: IAttendanceService,
    @Inject(PayrollServiceKey) private readonly payrollService: IPayrollService,
  ) {}

  async handleChat(userId: string, message: string, threadId?: string): Promise<string> {
    this.logger.log(`Processing chat for user ${userId}: ${message} (Thread: ${threadId || 'new'})`);

    const thread = await this.chatRepo.findOrCreateThread(userId, 'gemini-2.0-flash', threadId, message.substring(0, 30));
    
    // Lấy lịch sử chat (giới hạn 10 tin gần nhất để tiết kiệm token)
    const rawHistory = await this.getChatHistory(userId, thread.id);
    const history: IAiMessage[] = rawHistory.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    await this.chatRepo.saveMessage(thread.id, userId, 'user', message);

    const context = await this.getUnifiedSystemContext(userId);
    
    // Sử dụng AskWithTools với ngữ cảnh tách biệt để tăng khả năng tập trung
    const aiResponse = await this.aiProvider.askWithTools(message, this.tools, history, context);

    if (aiResponse.functionCall) {
      this.logger.log(`AI Requested Tool Call: ${aiResponse.functionCall.name}`);
      try {
        const result = await this.executeTool(userId, aiResponse.functionCall.name, aiResponse.functionCall.args);
        
        const finalAnswer = await this.aiProvider.askWithContext(
          `KẾT QUẢ THỰC THI HÀNH ĐỘNG: ${result}\nAnh/chị hãy thông báo kết quả này cho người dùng một cách thân thiện.`,
          message,
          history
        );
        
        await this.chatRepo.saveMessage(thread.id, userId, 'assistant', finalAnswer);
        return finalAnswer;
      } catch (error: any) {
        this.logger.error('Tool Execution Failed:', error);
        
        const errorExplanation = await this.aiProvider.askWithContext(
          `HÀNH ĐỘNG THẤT BẠI: Lỗi "${error.message}". 
          Anh/chị hãy giải thích nhẹ nhàng cho người dùng lý do thất bại và mời họ cung cấp thông tin chính xác hoặc còn thiếu để mình thực hiện lại nhé.`,
          message,
          history
        );
        
        await this.chatRepo.saveMessage(thread.id, userId, 'assistant', errorExplanation);
        return errorExplanation;
      }
    }

    const finalAnswer = aiResponse.message;
    await this.chatRepo.saveMessage(thread.id, userId, 'assistant', finalAnswer);
    return finalAnswer;
  }

  private async getUnifiedSystemContext(userId: string): Promise<string> {
    try {
      // 1. Dữ liệu kho & danh mục
      const allStockPromise = this.stockRepo.getDetailedStock();
      const allProductsPromise = this.productRepo.findAllWithFilters();
      const allWarehousesPromise = this.warehouseService.getWarehousesByUserId(userId);
      
      // 2. Dữ liệu báo cáo (Doanh thu tháng này)
      const salesReportPromise = this.reportService.getSalesReport('month');

      // 3. Dữ liệu nhân sự của User đang chat
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const attendancePromise = this.attendanceService.getHistory(userId, currentMonth, currentYear);
      const payrollPromise = this.payrollService.getPayroll(userId, currentMonth, currentYear);

      const [allStock, allProducts, allWarehouses, salesReport, attendanceHistory, payroll] = await Promise.all([
        allStockPromise,
        allProductsPromise,
        allWarehousesPromise,
        salesReportPromise,
        attendancePromise,
        payrollPromise
      ]);

      // --- Formatting Context ---
      let context = 'HỆ THỐNG POCKET MINI - THÔNG TIN CHI TIẾT:\n\n';

      // Danh sách kho
      const whList = (allWarehouses || []).map(w => `- ${w.name} (Địa chỉ: ${w.location || 'N/A'})`).join('\n');
      context += `DANH SÁCH KHO HÀNG ĐANG CÓ:\n${whList || 'Không có kho nào'}\n\n`;

      // Tồn kho chi tiết
      context += `TỒN KHO CHI TIẾT (Theo Sản phẩm & Kho):\n`;
      const stockLines = (allProducts.items || []).map(p => {
        const productStocks = allStock?.filter(st => st.productId === p.id) || [];
        if (productStocks.length === 0) {
          return `- ${p.name}: 0 cái (Chưa có trong kho)`;
        }
        const whDetails = productStocks.map(s => `${s.warehouseName}: ${s.quantity} cái`).join(', ');
        return `- ${p.name}: Tổng ${productStocks.reduce((acc, curr) => acc + curr.quantity, 0)} cái [${whDetails}] (Giá: ${p.price})`;
      }).join('\n');
      context += `${stockLines || 'Trống'}\n\n`;

      // Báo cáo doanh thu
      const kpi = salesReport.kpi;
      context += `BÁO CÁO DOANH THU THÁNG CỦA HỆ THỐNG:\n- Tổng doanh thu: ${kpi.totalRevenue}\n- Tổng giá vốn: ${kpi.totalCost}\n- Số đơn hàng: ${kpi.totalOrders}\n\n`;

      // Nhân sự cá nhân
      const daysWorked = attendanceHistory?.length || 0;
      context += `THÔNG TIN NHÂN SỰ/LƯƠNG CỦA BẠN (User: ${userId}):\n- Số ngày công tháng này: ${daysWorked}\n`;
      if (payroll) {
        context += `- Lương tạm tính tháng này: ${payroll.totalSalary} (Trạng thái: ${payroll.status})\n`;
      }

      return context;
    } catch (error) {
      this.logger.error('Error fetching unified context:', error);
      return 'Lỗi khi tải dữ liệu hệ thống chuyên sâu.';
    }
  }

  private async executeTool(userId: string, name: string, args: any): Promise<string> {
    if (name === 'create_stock_in_slip') {
      const { items, supplierName, warehouseName } = args;
      const suppliers = await this.supplierService.getAllSuppliers(supplierName);
      if (!suppliers || suppliers.items.length === 0) throw new Error(`Không tìm thấy nhà cung cấp nào tên "${supplierName}".`);
      const supplier = suppliers.items[0];
      const warehouse = await this.getWarehouseByName(userId, warehouseName);
      const slipItems = await this.resolveItems(items);
      const referenceCode = `AI-IN-${this.genId()}`;
      const slip = await this.stockInService.createStockIn(supplier.id, warehouse.id, userId, referenceCode, slipItems.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })), 'AI ASSISTANT');
      const itemsDesc = slipItems.map(i => `${i.productName} (x${i.quantity})`).join(', ');
      return `Thành công! Đã tạo Phiếu nhập #${slip.referenceCode} từ nhà cung cấp ${supplier.name} vào ${warehouse.name}: ${itemsDesc}.`;
    }

    if (name === 'create_stock_out_slip') {
      const { items, customerName, warehouseName } = args;
      const customers = await this.customerService.getAllCustomers(customerName);
      if (!customers || customers.items.length === 0) throw new Error(`Không tìm thấy khách hàng nào tên "${customerName}".`);
      const customer = customers.items[0];
      const warehouse = await this.getWarehouseByName(userId, warehouseName);
      const slipItems = await this.resolveItems(items);
      const referenceCode = `AI-OUT-${this.genId()}`;
      const slip = await this.stockOutService.createStockOut(customer.id, warehouse.id, userId, referenceCode, slipItems.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })), 'AI ASSISTANT');
      const itemsDesc = slipItems.map(i => `${i.productName} (x${i.quantity})`).join(', ');
      return `Thành công! Đã tạo Phiếu xuất #${slip.referenceCode} cho khách hàng ${customer.name} từ ${warehouse.name}: ${itemsDesc}.`;
    }

    if (name === 'create_stock_transfer_slip') {
      const { items, fromWarehouseName, toWarehouseName } = args;
      const fromWarehouse = await this.getWarehouseByName(userId, fromWarehouseName);
      const toWarehouse = await this.getWarehouseByName(userId, toWarehouseName);
      if (fromWarehouse.id === toWarehouse.id) throw new Error('Kho đi và kho đến không được trùng nhau.');
      const slipItems = await this.resolveItems(items);
      const referenceCode = `AI-TR-${this.genId()}`;
      const slip = await this.stockTransferService.createTransfer(fromWarehouse.id, toWarehouse.id, userId, referenceCode, slipItems.map(i => ({ productId: i.productId, quantity: i.quantity })), 'AI ASSISTANT');
      const itemsDesc = slipItems.map(i => `${i.productName} (x${i.quantity})`).join(', ');
      return `Thành công! Đã tạo Phiếu chuyển #${slip.referenceCode} từ ${fromWarehouse.name} sang ${toWarehouse.name}: ${itemsDesc}.`;
    }

    if (name === 'create_customer') {
        const { name, phone, email, address } = args;
        const customer = await this.customerService.createCustomer(name, email || null, phone, address || '', 'INDIVIDUAL');
        return `Thành công! Đã thêm khách hàng mới: ${customer.name} (SĐT: ${customer.phone}).`;
    }

    if (name === 'create_supplier') {
        const { name, phone, email, address } = args;
        const supplier = await this.supplierService.createSupplier(name, name, phone, email || null, address || '');
        return `Thành công! Đã thêm nhà cung cấp mới: ${supplier.name} (SĐT: ${supplier.phone}).`;
    }

    throw new Error(`Công cụ ${name} chưa được hỗ trợ.`);
  }

  private async getWarehouseByName(userId: string, name?: string) {
    const warehouses = await this.warehouseService.getWarehousesByUserId(userId);
    const normalizedQuery = name?.toLowerCase().trim();
    
    // 1. Tìm chính xác tuyệt đối
    let warehouse = warehouses.find(w => w.name.toLowerCase() === normalizedQuery);
    
    // 2. Tìm chứa chuỗi (nếu không có chính xác)
    if (!warehouse && normalizedQuery) {
        warehouse = warehouses.find(w => w.name.toLowerCase().includes(normalizedQuery));
    }

    // 3. Mặc định kho chính nếu không tìm thấy gì
    if (!warehouse) {
        warehouse = warehouses.find(w => w.name.toLowerCase().includes('kho chính')) || warehouses[0];
    }
    
    if (!warehouse) {
       throw new Error('Hệ thống hiện chưa có kho hàng nào.');
    }
    return warehouse;
  }

  private async resolveItems(items: any[]): Promise<{ productId: string, productName: string, quantity: number, price: number }[]> {
    const resolved: { productId: string, productName: string, quantity: number, price: number }[] = [];
    
    // Các từ phổ biến nên loại bỏ khi tìm tên sản phẩm để tăng độ chính xác
    const stopWords = ['cái', 'chiếc', 'bộ', 'thùng', 'bao', 'gói', 'hộp', 'kg', 'túi'];
    
    for (const item of items) {
      let searchTerm = item.productName.trim();
      
      // Loại bỏ stop words ở đầu câu
      const words = searchTerm.split(' ');
      if (words.length > 1 && stopWords.includes(words[0].toLowerCase())) {
        searchTerm = words.slice(1).join(' ');
      }

      const fuzzySearch = searchTerm.replace(/\s+/g, '%');
      let products = await this.productRepo.findAllWithFilters(fuzzySearch);
      
      if (!products || products.items.length === 0) {
        // Fallback: Tìm theo từ cuối cùng (thường là danh từ chính)
        const lastWord = words[words.length - 1];
        products = await this.productRepo.findAllWithFilters(lastWord);
      }
      
      if (!products || products.items.length === 0) {
        throw new Error(`Dạ sếp ơi, em không tìm thấy sản phẩm nào tên là "${item.productName}" trong danh mục ạ.`);
      }
      
      const product = products.items[0];
      resolved.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: item.price || product.price || 0
      });
    }
    return resolved;
  }

  private genId() {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  async getChatHistory(userId: string, threadId?: string): Promise<any[]> {
    let thread: any = null;
    if (threadId) {
      thread = await this.chatRepo.findOrCreateThread(userId, 'gemini-2.0-flash', threadId);
    } else {
      thread = await this.chatRepo.getLatestThreadByUser(userId);
    }

    if (!thread) return [];
    const messages = await this.chatRepo.getMessagesByThread(thread.id);
    return messages.map(m => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }

  async getUserThreads(userId: string): Promise<any[]> {
    const threads = await this.chatRepo.getUserThreads(userId);
    return threads.map(t => ({
      id: t.id,
      title: t.title,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
  }

  async deleteThread(userId: string, threadId: string): Promise<void> {
    this.logger.log(`Deleting thread ${threadId} for user ${userId}`);
    await this.chatRepo.deleteThread(userId, threadId);
  }

  async clearChatHistory(userId: string): Promise<void> {
    this.logger.log(`Clearing chat history for user ${userId}`);
    await this.chatRepo.clearUserHistory(userId);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOldChatMessages() {
    this.logger.log('Starting daily auto-prune for AI chat messages older than 30 days...');
    try {
      await this.chatRepo.deleteOldMessages(30);
      this.logger.log('Successfully pruned old chat messages.');
    } catch (error) {
      this.logger.error('Failed to prune old chat messages:', error);
    }
  }
}
