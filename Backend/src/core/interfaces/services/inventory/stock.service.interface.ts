import { Inventory } from '../../../domain/entities/warehouse/inventory.entity';

export const IStockServiceKey = 'IStockService';

export interface IStockService {
    getStockByWarehouse(warehouseId: string): Promise<Inventory[]>;
    getStockByProduct(productId: string): Promise<Inventory[]>;
    getStockItem(warehouseId: string, productId: string): Promise<Inventory | null>;
    getLowStock(warehouseId: string): Promise<Inventory[]>;
    getTotalStockByProduct(productId: string): Promise<number>;
    getDetailedStock(warehouseId?: string): Promise<any[]>;
}
