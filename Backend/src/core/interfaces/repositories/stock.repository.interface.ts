import { Inventory } from '../../domain/entities/warehouse/inventory.entity';
import { IBaseRepository } from './base.repository.interface';

export interface IStockRepository extends IBaseRepository<Inventory> {
    findByWarehouse(warehouseId: string): Promise<Inventory[]>;
    findByProduct(productId: string): Promise<Inventory[]>;
    findByWarehouseAndProduct(warehouseId: string, productId: string): Promise<Inventory | null>;
    getLowStock(warehouseId: string): Promise<Inventory[]>;
    upsert(warehouseId: string, productId: string, quantity: number): Promise<Inventory>;
    getTotalStockByProduct(productId: string): Promise<number>;
    getDetailedStock(warehouseId?: string): Promise<any[]>;
}
