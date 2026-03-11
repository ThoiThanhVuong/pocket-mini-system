import { StockIn } from '../../domain/entities/warehouse/stock-in.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IStockInRepository extends IBaseRepository<StockIn> {
    findByWarehouse(warehouseId: string): Promise<StockIn[]>;
    findByStatus(status: string): Promise<StockIn[]>;
    findWithItems(id: string): Promise<StockIn | null>;
}
