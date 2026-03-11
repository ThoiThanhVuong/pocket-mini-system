import { Injectable, Inject } from '@nestjs/common';
import { Inventory } from '../../core/domain/entities/warehouse/inventory.entity';
import type { IStockRepository } from '../../core/interfaces/repositories/stock.repository.interface';
import { IStockService } from '../../core/interfaces/services/stock.service.interface';

export const IStockRepositoryKey = 'IStockRepository';

@Injectable()
export class StockService implements IStockService {
    constructor(
        @Inject(IStockRepositoryKey)
        private readonly stockRepo: IStockRepository,
    ) {}

    async getStockByWarehouse(warehouseId: string): Promise<Inventory[]> {
        return this.stockRepo.findByWarehouse(warehouseId);
    }

    async getStockByProduct(productId: string): Promise<Inventory[]> {
        return this.stockRepo.findByProduct(productId);
    }

    async getStockItem(warehouseId: string, productId: string): Promise<Inventory | null> {
        return this.stockRepo.findByWarehouseAndProduct(warehouseId, productId);
    }

    async getLowStock(warehouseId: string): Promise<Inventory[]> {
        return this.stockRepo.getLowStock(warehouseId);
    }

    async getTotalStockByProduct(productId: string): Promise<number> {
        return this.stockRepo.getTotalStockByProduct(productId);
    }

    async getDetailedStock(warehouseId?: string): Promise<any[]> {
        return this.stockRepo.getDetailedStock(warehouseId);
    }
}
