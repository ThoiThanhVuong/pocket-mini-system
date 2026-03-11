import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockOut } from '../../core/domain/entities/warehouse/stock-out.entity';
import { TransactionStatus } from '../../core/domain/enums/transaction-status.enum';
import type { IStockOutRepository } from '../../core/interfaces/repositories/stock-out.repository.interface';
import type { IStockRepository } from '../../core/interfaces/repositories/stock.repository.interface';
import { IStockOutService, StockOutItemInput } from '../../core/interfaces/services/stock-out.service.interface';
import { IPaymentServiceKey } from '../../core/interfaces/services/payment.service.interface';
import type { IPaymentService } from '../../core/interfaces/services/payment.service.interface';
import { IAuditServiceKey } from '../../core/interfaces/services/audit.service.interface';
import type { IAuditService } from '../../core/interfaces/services/audit.service.interface';
import { INoteServiceKey } from '../../core/interfaces/services/note.service.interface';
import type { INoteService } from '../../core/interfaces/services/note.service.interface';

export const IStockOutRepositoryKey = 'IStockOutRepository';

@Injectable()
export class StockOutService implements IStockOutService {
    constructor(
        @Inject(IStockOutRepositoryKey)
        private readonly stockOutRepo: IStockOutRepository & {
            saveNew(id: string, customerId: string, warehouseId: string,
                userId: string, referenceCode: string, status: string,
                items: { productId: string; quantity: number; price: number }[]
            ): Promise<void>;
        },
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
        @Inject(IPaymentServiceKey)
        private readonly paymentService: IPaymentService,
        @Inject(IAuditServiceKey)
        private readonly auditService: IAuditService,
        @Inject(INoteServiceKey)
        private readonly noteService: INoteService,
    ) {}

    async createStockOut(
        customerId: string, warehouseId: string, userId: string,
        referenceCode: string, items: StockOutItemInput[], notes?: string,
    ): Promise<StockOut> {
        const id = uuidv4();
        await this.stockOutRepo.saveNew(id, customerId, warehouseId, userId, referenceCode, TransactionStatus.PENDING, items);
        
        // Tạo phiếu thu
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await this.paymentService.createPayment({
            referenceType: 'stock_out',
            referenceId: id,
            amount: totalAmount,
            paymentDescription: `Thu tiền xuất kho ${referenceCode}`
        });

        const created = await this.stockOutRepo.findWithItems(id);
        if (!created) throw new BadRequestException('Failed to create stock-out');

        // Ghi Audit Log
        await this.auditService.log('stock_out', id, 'CREATE', userId, {
            referenceCode,
            totalAmount,
            warehouseId,
            customerId
        });

        // Lưu ghi chú nếu có
        if (notes && notes.trim()) {
            await this.noteService.addNote('stock_out', id, userId, notes.trim());
        }

        return created;
    }

    /**
     * Duyệt phiếu xuất: PENDING → APPROVED
     * - Kiểm tra đủ hàng trong kho
     * - Trừ tồn kho
     * - Status chuyển sang APPROVED (đang giao)
     */
    async approveStockOut(id: string): Promise<StockOut> {
        const stockOut = await this.stockOutRepo.findWithItems(id);
        if (!stockOut) throw new NotFoundException(`StockOut #${id} not found`);
        if (stockOut.status !== TransactionStatus.PENDING) {
            throw new BadRequestException('Chỉ phiếu PENDING mới có thể duyệt');
        }

        // Kiểm tra đủ hàng & trừ tồn kho
        for (const item of stockOut.items) {
            const stock = await this.stockRepo.findByWarehouseAndProduct(stockOut.warehouseId, item.productId);
            if (!stock || stock.quantity < item.quantity) {
                throw new BadRequestException(
                    `Không đủ hàng trong kho cho sản phẩm ${item.productId}. Tồn kho: ${stock?.quantity ?? 0}, Cần: ${item.quantity}`
                );
            }
            await this.stockRepo.upsert(stockOut.warehouseId, item.productId, -item.quantity);
        }

        stockOut.status = TransactionStatus.APPROVED;
        await this.stockOutRepo.save(stockOut);

        // Ghi Audit Log
        await this.auditService.log('stock_out', id, 'APPROVE', stockOut.userId, {
            status: 'APPROVED'
        });

        return stockOut;
    }

    /**
     * Hoàn thành phiếu xuất: APPROVED → COMPLETED
     * - Đã giao hàng thành công
     * - Không thay đổi tồn kho (đã trừ lúc approve)
     * - Sau khi COMPLETED → không thể sửa/hủy
     */
    async completeStockOut(id: string): Promise<StockOut> {
        const stockOut = await this.stockOutRepo.findWithItems(id);
        if (!stockOut) throw new NotFoundException(`StockOut #${id} not found`);
        if (stockOut.status !== TransactionStatus.APPROVED) {
            throw new BadRequestException('Chỉ phiếu APPROVED (đang giao) mới có thể hoàn thành');
        }

        stockOut.status = TransactionStatus.COMPLETED;
        await this.stockOutRepo.save(stockOut);

        // Ghi Audit Log
        await this.auditService.log('stock_out', id, 'COMPLETE', stockOut.userId, {
            status: 'COMPLETED'
        });

        return stockOut;
    }

    /**
     * Hủy phiếu xuất:
     * - PENDING → CANCELLED: chưa trừ tồn kho nên không cần hoàn
     * - APPROVED → CANCELLED: đã trừ tồn kho → hoàn trả lại
     * - COMPLETED → không cho hủy
     */
    async cancelStockOut(id: string): Promise<StockOut> {
        const stockOut = await this.stockOutRepo.findWithItems(id);
        if (!stockOut) throw new NotFoundException(`StockOut #${id} not found`);
        if (stockOut.status === TransactionStatus.COMPLETED) {
            throw new BadRequestException('Phiếu đã hoàn thành, không thể hủy');
        }
        if (stockOut.status === TransactionStatus.CANCELLED) {
            throw new BadRequestException('Phiếu đã bị hủy rồi');
        }

        // Nếu APPROVED (đã trừ tồn kho) → hoàn trả
        if (stockOut.status === TransactionStatus.APPROVED) {
            for (const item of stockOut.items) {
                await this.stockRepo.upsert(stockOut.warehouseId, item.productId, +item.quantity);
            }
        }

        stockOut.status = TransactionStatus.CANCELLED;
        await this.stockOutRepo.save(stockOut);
        
        // Huỷ dòng tiền
        await this.paymentService.markAsCancelledByReference(id);

        // Ghi Audit Log
        await this.auditService.log('stock_out', id, 'CANCEL', stockOut.userId, {
            status: 'CANCELLED'
        });

        return stockOut;
    }

    async getAll(warehouseId?: string, status?: string): Promise<StockOut[]> {
        if (warehouseId && status) {
            const list = await this.stockOutRepo.findByWarehouse(warehouseId);
            return list.filter(s => s.status === status);
        }
        if (warehouseId) return this.stockOutRepo.findByWarehouse(warehouseId);
        if (status) return this.stockOutRepo.findByStatus(status);
        return this.stockOutRepo.findAll();
    }

    async getById(id: string): Promise<StockOut | null> {
        return this.stockOutRepo.findWithItems(id);
    }
}
