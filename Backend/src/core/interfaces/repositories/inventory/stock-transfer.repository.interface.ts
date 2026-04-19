import { StockTransfer } from '../../../domain/entities/warehouse/stock-transfer.entity';
import { IBaseRepository } from '../base.repository.interface';
import { IPaginationOptions, IPaginatedResult } from '../../../../shared/types/pagination.type';

export interface IStockTransferRepository extends IBaseRepository<StockTransfer> {
    findByFromWarehouse(warehouseId: string): Promise<StockTransfer[]>;
    findByToWarehouse(warehouseId: string): Promise<StockTransfer[]>;
    findByStatus(status: string): Promise<StockTransfer[]>;
    findWithItems(id: string): Promise<StockTransfer | null>;
    findAllPaginated(
        options: IPaginationOptions,
        filters?: { 
            fromWarehouseId?: string, 
            toWarehouseId?: string, 
            status?: string, 
            search?: string 
        }
    ): Promise<IPaginatedResult<StockTransfer>>;
    saveNew(
        id: string, fromWarehouseId: string, toWarehouseId: string,
        userId: string, referenceCode: string, status: string,
        items: { productId: string; quantity: number }[],
    ): Promise<void>;
}
