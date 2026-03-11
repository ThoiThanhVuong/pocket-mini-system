import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockIn } from '../../core/domain/entities/warehouse/stock-in.entity';
import { TransactionStatus } from '../../core/domain/enums/transaction-status.enum';
import type { IStockInRepository } from '../../core/interfaces/repositories/stock-in.repository.interface';
import type { IStockRepository } from '../../core/interfaces/repositories/stock.repository.interface';
import type { IWarehouseRepository } from '../../core/interfaces/repositories/warehouse.repository.interface';
import { IStockInService, StockInItemInput } from '../../core/interfaces/services/stock-in.service.interface';
import { IPaymentServiceKey } from '../../core/interfaces/services/payment.service.interface';
import type { IPaymentService } from '../../core/interfaces/services/payment.service.interface';
import { IAuditServiceKey } from '../../core/interfaces/services/audit.service.interface';
import type { IAuditService } from '../../core/interfaces/services/audit.service.interface';
import { INoteServiceKey } from '../../core/interfaces/services/note.service.interface';
import type { INoteService } from '../../core/interfaces/services/note.service.interface';

export const IStockInRepositoryKey = 'IStockInRepository';
export const IStockRepositoryForStockInKey = 'IStockRepositoryForStockIn';

@Injectable()
export class StockInService implements IStockInService {
    constructor(
        @Inject(IStockInRepositoryKey)
        private readonly stockInRepo: IStockInRepository & {
            saveNew(id: string, supplierId: string, warehouseId: string,
                userId: string, referenceCode: string, status: string,
                items: { productId: string; quantity: number; price: number }[]
            ): Promise<void>;
        },
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
        @Inject('IWarehouseRepository')
        private readonly warehouseRepo: IWarehouseRepository,
        @Inject(IPaymentServiceKey)
        private readonly paymentService: IPaymentService,
        @Inject(IAuditServiceKey)
        private readonly auditService: IAuditService,
        @Inject(INoteServiceKey)
        private readonly noteService: INoteService,
    ) {}

    async createStockIn(
        supplierId: string, warehouseId: string, userId: string,
        referenceCode: string, items: StockInItemInput[], notes?: string,
    ): Promise<StockIn> {
        const id = uuidv4();
        await this.stockInRepo.saveNew(id, supplierId, warehouseId, userId, referenceCode, TransactionStatus.PENDING, items);
        
        // Tạo phiếu chi
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await this.paymentService.createPayment({
            referenceType: 'stock_in',
            referenceId: id,
            amount: totalAmount,
            paymentDescription: `Thanh toán nhập kho ${referenceCode}`
        });

        const created = await this.stockInRepo.findWithItems(id);
        if (!created) throw new BadRequestException('Failed to create stock-in');

        // Ghi Audit Log
        await this.auditService.log('stock_in', id, 'CREATE', userId, {
            referenceCode,
            totalAmount,
            warehouseId,
        });

        // Lưu ghi chú nếu có
        if (notes && notes.trim()) {
            await this.noteService.addNote('stock_in', id, userId, notes.trim());
        }

        return created;
    }

    /**
     * Duyệt phiếu nhập: PENDING → APPROVED
     * - Kiểm tra sức chứa kho trước khi nhập
     * - Tăng tồn kho theo số lượng nhập
     * - Status chuyển sang APPROVED (đang xử lý)
     */
    async approveStockIn(id: string): Promise<StockIn> {
        const stockIn = await this.stockInRepo.findWithItems(id);
        if (!stockIn) throw new NotFoundException(`StockIn #${id} not found`);
        if (stockIn.status !== TransactionStatus.PENDING) {
            throw new BadRequestException('Chỉ phiếu PENDING mới có thể duyệt');
        }

        // Kiểm tra sức chứa kho
        const warehouse = await this.warehouseRepo.findOneById(stockIn.warehouseId);
        if (warehouse && warehouse.capacity) {
            // Tổng tồn kho hiện tại của kho
            const existingStock = await this.stockRepo.findByWarehouse(stockIn.warehouseId);
            const currentTotal = existingStock.reduce((sum, s) => sum + s.quantity, 0);
            // Tổng số lượng nhập thêm
            const incomingTotal = stockIn.items.reduce((sum, i) => sum + i.quantity, 0);
            if (currentTotal + incomingTotal > warehouse.capacity) {
                throw new BadRequestException(
                    `Kho "${warehouse.name}" không đủ sức chứa! ` +
                    `Hiện tại: ${currentTotal}, Nhập thêm: ${incomingTotal}, ` +
                    `Sức chứa tối đa: ${warehouse.capacity}`
                );
            }
        }

        // Tăng tồn kho
        for (const item of stockIn.items) {
            await this.stockRepo.upsert(stockIn.warehouseId, item.productId, item.quantity);
        }

        stockIn.status = TransactionStatus.APPROVED;
        await this.stockInRepo.save(stockIn);

        // Ghi Audit Log
        await this.auditService.log('stock_in', id, 'APPROVE', stockIn.userId, {
            status: 'APPROVED'
        });

        return stockIn;
    }

    /**
     * Hoàn thành phiếu nhập: APPROVED → COMPLETED
     * - Nhập kho xong, xác nhận đầy đủ
     * - Không thay đổi tồn kho (đã tăng lúc approve)
     * - Sau khi COMPLETED → không thể sửa/hủy
     */
    async completeStockIn(id: string): Promise<StockIn> {
        const stockIn = await this.stockInRepo.findWithItems(id);
        if (!stockIn) throw new NotFoundException(`StockIn #${id} not found`);
        if (stockIn.status !== TransactionStatus.APPROVED) {
            throw new BadRequestException('Chỉ phiếu APPROVED mới có thể hoàn thành');
        }

        stockIn.status = TransactionStatus.COMPLETED;
        await this.stockInRepo.save(stockIn);

        // Ghi Audit Log
        await this.auditService.log('stock_in', id, 'COMPLETE', stockIn.userId, {
            status: 'COMPLETED'
        });

        return stockIn;
    }

    /**
     * Hủy phiếu nhập:
     * - PENDING → CANCELLED: chưa tăng tồn kho nên không cần trừ
     * - APPROVED → CANCELLED: đã tăng tồn kho → trừ lại (kiểm tra đủ không)
     * - COMPLETED → không cho hủy
     */
    async cancelStockIn(id: string): Promise<StockIn> {
        const stockIn = await this.stockInRepo.findWithItems(id);
        if (!stockIn) throw new NotFoundException(`StockIn #${id} not found`);
        if (stockIn.status === TransactionStatus.COMPLETED) {
            throw new BadRequestException('Phiếu đã hoàn thành, không thể hủy');
        }
        if (stockIn.status === TransactionStatus.CANCELLED) {
            throw new BadRequestException('Phiếu đã bị hủy rồi');
        }

        // Nếu APPROVED (đã tăng tồn kho) → trừ lại
        if (stockIn.status === TransactionStatus.APPROVED) {
            for (const item of stockIn.items) {
                const stock = await this.stockRepo.findByWarehouseAndProduct(stockIn.warehouseId, item.productId);
                if (!stock || stock.quantity < item.quantity) {
                    throw new BadRequestException(
                        `Không thể hủy: tồn kho sản phẩm ${item.productId} hiện tại (${stock?.quantity ?? 0}) ` +
                        `không đủ để trừ lại ${item.quantity}. Có thể hàng đã xuất.`
                    );
                }
                await this.stockRepo.upsert(stockIn.warehouseId, item.productId, -item.quantity);
            }
        }

        stockIn.status = TransactionStatus.CANCELLED;
        await this.stockInRepo.save(stockIn);
        
        // Huỷ dòng tiền
        await this.paymentService.markAsCancelledByReference(id);

        // Ghi Audit Log
        await this.auditService.log('stock_in', id, 'CANCEL', stockIn.userId, {
            status: 'CANCELLED'
        });

        return stockIn;
    }

    async getAll(warehouseId?: string, status?: string): Promise<StockIn[]> {
        if (warehouseId && status) {
            const list = await this.stockInRepo.findByWarehouse(warehouseId);
            return list.filter(s => s.status === status);
        }
        if (warehouseId) return this.stockInRepo.findByWarehouse(warehouseId);
        if (status) return this.stockInRepo.findByStatus(status);
        return this.stockInRepo.findAll();
    }

    async getById(id: string): Promise<StockIn | null> {
        return this.stockInRepo.findWithItems(id);
    }
}
