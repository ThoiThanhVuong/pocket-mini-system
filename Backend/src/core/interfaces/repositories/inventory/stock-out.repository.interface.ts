import { StockOut } from '../../../domain/entities/warehouse/stock-out.entity';
import { IBaseRepository } from '../base.repository.interface';

export interface IStockOutRepository extends IBaseRepository<StockOut> {
    findByWarehouse(warehouseId: string): Promise<StockOut[]>;
    findByStatus(status: string): Promise<StockOut[]>;
    findWithItems(id: string): Promise<StockOut | null>;
}
