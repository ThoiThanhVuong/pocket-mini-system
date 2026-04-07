import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockTransfer } from '../../../core/domain/entities/warehouse/stock-transfer.entity';
import { TransactionStatus } from '../../../core/domain/enums/transaction-status.enum';
import type { IStockTransferRepository } from '../../../core/interfaces/repositories/inventory/stock-transfer.repository.interface';
import type { IStockRepository } from '../../../core/interfaces/repositories/inventory/stock.repository.interface';
import { IStockTransferService, StockTransferItemInput } from '../../../core/interfaces/services/inventory/stock-transfer.service.interface';
import { IAuditServiceKey } from '../../../core/interfaces/services/system/audit.service.interface';
import type { IAuditService } from '../../../core/interfaces/services/system/audit.service.interface';
import { INoteServiceKey } from '../../../core/interfaces/services/system/note.service.interface';
import type { INoteService } from '../../../core/interfaces/services/system/note.service.interface';

export const IStockTransferRepositoryKey = 'IStockTransferRepository';

@Injectable()
export class StockTransferService implements IStockTransferService {
    constructor(
        @Inject(IStockTransferRepositoryKey)
        private readonly transferRepo: IStockTransferRepository & {
            saveNew(id: string, fromWarehouseId: string, toWarehouseId: string,
                userId: string, referenceCode: string, status: string,
                items: { productId: string; quantity: number }[]
            ): Promise<void>;
        },
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
        @Inject(IAuditServiceKey)
        private readonly auditService: IAuditService,
        @Inject(INoteServiceKey)
        private readonly noteService: INoteService,
    ) {}

    async createTransfer(
        fromWarehouseId: string, toWarehouseId: string, userId: string,
        referenceCode: string, items: StockTransferItemInput[], notes?: string,
    ): Promise<StockTransfer> {
        if (fromWarehouseId === toWarehouseId) {
            throw new BadRequestException('Kho nguồn và kho đích không được trùng nhau');
        }
        const id = uuidv4();
        await this.transferRepo.saveNew(id, fromWarehouseId, toWarehouseId, userId, referenceCode, TransactionStatus.PENDING, items);
        const created = await this.transferRepo.findWithItems(id);
        if (!created) throw new BadRequestException('Failed to create stock transfer');

        // Ghi Audit Log
        await this.auditService.log('stock_transfer', id, 'CREATE', userId, {
            referenceCode,
            fromWarehouseId,
            toWarehouseId
        });

        // Lưu ghi chú nếu có
        if (notes && notes.trim()) {
            await this.noteService.addNote('stock_transfer', id, userId, notes.trim());
        }

        return created;
    }

    /**
     * Duyệt phiếu điều chuyển: PENDING → APPROVED
     * - Kiểm tra đủ hàng tại kho nguồn
     * - Trừ kho nguồn + tăng kho đích
     * - Status chuyển sang APPROVED (đang điều chuyển)
     */
    async approveTransfer(id: string): Promise<StockTransfer> {
        const transfer = await this.transferRepo.findWithItems(id);
        if (!transfer) throw new NotFoundException(`StockTransfer #${id} not found`);
        if (transfer.status !== TransactionStatus.PENDING) {
            throw new BadRequestException('Chỉ phiếu PENDING mới có thể duyệt');
        }

        // Kiểm tra đủ hàng tại kho nguồn
        for (const item of transfer.items) {
            const stock = await this.stockRepo.findByWarehouseAndProduct(
                transfer.fromWarehouseId, item.productId,
            );
            if (!stock || stock.quantity < item.quantity) {
                throw new BadRequestException(
                    `Không đủ hàng tại kho nguồn cho sản phẩm ${item.productId}. ` +
                    `Tồn kho: ${stock?.quantity ?? 0}, Cần chuyển: ${item.quantity}`
                );
            }
        }

        // Trừ kho nguồn + tăng kho đích
        for (const item of transfer.items) {
            await this.stockRepo.upsert(transfer.fromWarehouseId, item.productId, -item.quantity);
            await this.stockRepo.upsert(transfer.toWarehouseId, item.productId, item.quantity);
        }

        transfer.status = TransactionStatus.APPROVED;
        await this.transferRepo.save(transfer);

        // Ghi Audit Log
        await this.auditService.log('stock_transfer', id, 'APPROVE', transfer.userId, {
            status: 'APPROVED'
        });

        return transfer;
    }

    /**
     * Hoàn thành điều chuyển: APPROVED → COMPLETED
     * - Hàng đã chuyển xong giữa 2 kho
     * - Không thay đổi tồn kho (đã xử lý lúc approve)
     * - Sau khi COMPLETED → không thể sửa/hủy
     */
    async completeTransfer(id: string): Promise<StockTransfer> {
        const transfer = await this.transferRepo.findWithItems(id);
        if (!transfer) throw new NotFoundException(`StockTransfer #${id} not found`);
        if (transfer.status !== TransactionStatus.APPROVED) {
            throw new BadRequestException('Chỉ phiếu APPROVED mới có thể hoàn thành');
        }

        transfer.status = TransactionStatus.COMPLETED;
        await this.transferRepo.save(transfer);

        // Ghi Audit Log
        await this.auditService.log('stock_transfer', id, 'COMPLETE', transfer.userId, {
            status: 'COMPLETED'
        });

        return transfer;
    }

    /**
     * Hủy phiếu điều chuyển:
     * - PENDING → CANCELLED: chưa chuyển kho nên không cần hoàn
     * - APPROVED → CANCELLED: đã chuyển kho → hoàn trả (+qty kho nguồn, -qty kho đích)
     * - COMPLETED → không cho hủy
     */
    async cancelTransfer(id: string): Promise<StockTransfer> {
        const transfer = await this.transferRepo.findWithItems(id);
        if (!transfer) throw new NotFoundException(`StockTransfer #${id} not found`);
        if (transfer.status === TransactionStatus.COMPLETED) {
            throw new BadRequestException('Phiếu đã hoàn thành, không thể hủy');
        }
        if (transfer.status === TransactionStatus.CANCELLED) {
            throw new BadRequestException('Phiếu đã bị hủy rồi');
        }

        // Nếu APPROVED (đã chuyển kho) → hoàn trả
        if (transfer.status === TransactionStatus.APPROVED) {
            for (const item of transfer.items) {
                const destStock = await this.stockRepo.findByWarehouseAndProduct(
                    transfer.toWarehouseId, item.productId,
                );
                if (!destStock || destStock.quantity < item.quantity) {
                    throw new BadRequestException(
                        `Không thể hủy: tồn kho kho đích cho SP ${item.productId} ` +
                        `hiện tại (${destStock?.quantity ?? 0}) không đủ để trừ lại ${item.quantity}.`
                    );
                }
            }
            for (const item of transfer.items) {
                await this.stockRepo.upsert(transfer.toWarehouseId, item.productId, -item.quantity);
                await this.stockRepo.upsert(transfer.fromWarehouseId, item.productId, +item.quantity);
            }
        }

        transfer.status = TransactionStatus.CANCELLED;
        await this.transferRepo.save(transfer);

        // Ghi Audit Log
        await this.auditService.log('stock_transfer', id, 'CANCEL', transfer.userId, {
            status: 'CANCELLED'
        });

        return transfer;
    }

    async getAll(warehouseId?: string, status?: string): Promise<StockTransfer[]> {
        if (warehouseId && status) {
            const fromList = await this.transferRepo.findByFromWarehouse(warehouseId);
            const toList = await this.transferRepo.findByToWarehouse(warehouseId);
            const all = [...fromList, ...toList];
            const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            return unique.filter(t => t.status === status);
        }
        if (warehouseId) {
            const fromList = await this.transferRepo.findByFromWarehouse(warehouseId);
            const toList = await this.transferRepo.findByToWarehouse(warehouseId);
            const all = [...fromList, ...toList];
            return all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        }
        if (status) return this.transferRepo.findByStatus(status);
        return this.transferRepo.findAll();
    }

    async getById(id: string): Promise<StockTransfer | null> {
        return this.transferRepo.findWithItems(id);
    }
}
