import { StockOut } from '../../../domain/entities/warehouse/stock-out.entity';
import { IBaseRepository } from '../base.repository.interface';
import { IPaginationOptions, IPaginatedResult } from '../../../../shared/types/pagination.type';

export interface IStockOutRepository extends IBaseRepository<StockOut> {
    findByWarehouse(warehouseId: string): Promise<StockOut[]>;
    findByStatus(status: string): Promise<StockOut[]>;
    findWithItems(id: string): Promise<StockOut | null>;
    findByCustomer(customerId: string): Promise<StockOut[]>;
    findAllPaginated(
        options: IPaginationOptions,
        filters?: { warehouseId?: string, status?: string, search?: string, customerId?: string }
    ): Promise<IPaginatedResult<StockOut>>;
}
