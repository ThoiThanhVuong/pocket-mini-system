import { StockIn } from '../../../domain/entities/warehouse/stock-in.entity';
import { IBaseRepository } from '../base.repository.interface';
import { IPaginationOptions, IPaginatedResult } from '../../../../shared/types/pagination.type';

export interface IStockInRepository extends IBaseRepository<StockIn> {
    findByWarehouse(warehouseId: string): Promise<StockIn[]>;
    findByStatus(status: string): Promise<StockIn[]>;
    findWithItems(id: string): Promise<StockIn | null>;
    findAllPaginated(
        options: IPaginationOptions,
        filters?: { warehouseId?: string, status?: string, search?: string }
    ): Promise<IPaginatedResult<StockIn>>;
}
