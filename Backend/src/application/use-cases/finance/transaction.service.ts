import { Injectable, Inject } from '@nestjs/common';
import { ITransactionService } from '../../../core/interfaces/services/finance/transaction.service.interface';
import { TransactionDto } from '../../dtos/inventory/transaction.dto';
import { IStockInRepositoryKey } from '../inventory/stock-in.service';
import { IStockOutRepositoryKey } from '../inventory/stock-out.service';
import { IStockTransferRepositoryKey } from '../inventory/stock-transfer.service';
import { IStockInServiceKey } from '../../../core/interfaces/services/inventory/stock-in.service.interface';
import type { IStockInService } from '../../../core/interfaces/services/inventory/stock-in.service.interface';
import { IStockOutServiceKey } from '../../../core/interfaces/services/inventory/stock-out.service.interface';
import type { IStockOutService } from '../../../core/interfaces/services/inventory/stock-out.service.interface';
import { IStockTransferServiceKey } from '../../../core/interfaces/services/inventory/stock-transfer.service.interface';
import type { IStockTransferService } from '../../../core/interfaces/services/inventory/stock-transfer.service.interface';
import { IPaymentServiceKey } from '../../../core/interfaces/services/finance/payment.service.interface';
import type { IPaymentService } from '../../../core/interfaces/services/finance/payment.service.interface';

@Injectable()
export class TransactionService implements ITransactionService {
    constructor(
        @Inject(IStockInRepositoryKey) private readonly stockInRepo: any,
        @Inject(IStockInServiceKey) private readonly stockInService: IStockInService,
        @Inject(IStockOutRepositoryKey) private readonly stockOutRepo: any,
        @Inject(IStockOutServiceKey) private readonly stockOutService: IStockOutService,
        @Inject(IStockTransferRepositoryKey) private readonly stockTransferRepo: any,
        @Inject(IStockTransferServiceKey) private readonly stockTransferService: IStockTransferService,
        @Inject(IPaymentServiceKey) private readonly paymentService: IPaymentService,
    ) {}

    async getAllTransactions(warehouseId?: string, status?: string, type?: string, search?: string): Promise<TransactionDto[]> {
        const transactions: TransactionDto[] = [];
        const includeIn = !type || type === 'IN';
        const includeOut = !type || type === 'OUT';
        const includeTransfer = !type || type === 'TRANSFER';

        if (includeIn) {
            let stockIns = warehouseId ? await this.stockInRepo.findByWarehouse(warehouseId) : await this.stockInRepo.findAll();
            if (status && status !== 'ALL') {
                stockIns = stockIns.filter(t => t.status === status);
            }
            transactions.push(...stockIns.map(t => ({
                id: t.id,
                type: 'IN' as const,
                referenceCode: t.referenceCode,
                warehouseId: t.warehouseId,
                status: t.status,
                createdAt: t.createdAt,
            })));
        }

        if (includeOut) {
            let stockOuts = warehouseId ? await this.stockOutRepo.findByWarehouse(warehouseId) : await this.stockOutRepo.findAll();
            if (status && status !== 'ALL') {
                stockOuts = stockOuts.filter(t => t.status === status);
            }
            transactions.push(...stockOuts.map(t => ({
                id: t.id,
                type: 'OUT' as const,
                referenceCode: t.referenceCode,
                warehouseId: t.warehouseId,
                status: t.status,
                createdAt: t.createdAt,
            })));
        }

        if (includeTransfer) {
            let transfers = warehouseId ? await this.stockTransferRepo.findByFromWarehouse(warehouseId) : await this.stockTransferRepo.findAll();
            if (status && status !== 'ALL') {
                transfers = transfers.filter(t => t.status === status);
            }
            transactions.push(...transfers.map(t => ({
                id: t.id,
                type: 'TRANSFER' as const,
                referenceCode: t.referenceCode,
                fromWarehouseId: t.fromWarehouseId,
                toWarehouseId: t.toWarehouseId,
                status: t.status,
                createdAt: t.createdAt,
            })));
        }

        let result = transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Gắn thông tin thanh toán vào phiếu Nhập/Xuất
        const allPayments = await this.paymentService.getAllPayments();
        const paymentMap = new Map(allPayments.map(p => [p.referenceId, p.status]));

        result = result.map(t => {
            if (t.type === 'IN' || t.type === 'OUT') {
                 t.paymentStatus = paymentMap.get(t.id) || 'pending';
            }
            return t;
        });
        
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(t => t.referenceCode && t.referenceCode.toLowerCase().includes(lowerSearch));
        }
        
        return result;
    }

    async approveTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any> {
        if (type === 'IN') return this.stockInService.approveStockIn(id);
        if (type === 'OUT') return this.stockOutService.approveStockOut(id);
        if (type === 'TRANSFER') return this.stockTransferService.approveTransfer(id);
        throw new Error('Loại phiếu không hợp lệ');
    }

    async completeTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any> {
        if (type === 'IN') return this.stockInService.completeStockIn(id);
        if (type === 'OUT') return this.stockOutService.completeStockOut(id);
        if (type === 'TRANSFER') return this.stockTransferService.completeTransfer(id);
        throw new Error('Loại phiếu không hợp lệ');
    }

    async cancelTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any> {
        if (type === 'IN') return this.stockInService.cancelStockIn(id);
        if (type === 'OUT') return this.stockOutService.cancelStockOut(id);
        if (type === 'TRANSFER') return this.stockTransferService.cancelTransfer(id);
        throw new Error('Loại phiếu không hợp lệ');
    }
}
