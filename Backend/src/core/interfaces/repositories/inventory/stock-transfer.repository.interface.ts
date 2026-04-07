import { StockTransfer } from '../../../domain/entities/warehouse/stock-transfer.entity';
import { IBaseRepository } from '../base.repository.interface';

export interface IStockTransferRepository extends IBaseRepository<StockTransfer> {
    findByFromWarehouse(warehouseId: string): Promise<StockTransfer[]>;
    findByToWarehouse(warehouseId: string): Promise<StockTransfer[]>;
    findByStatus(status: string): Promise<StockTransfer[]>;
    findWithItems(id: string): Promise<StockTransfer | null>;
    saveNew(
        id: string, fromWarehouseId: string, toWarehouseId: string,
        userId: string, referenceCode: string, status: string,
        items: { productId: string; quantity: number }[],
    ): Promise<void>;
}
