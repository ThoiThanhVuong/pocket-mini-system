import { Warehouse } from '../../../domain/entities/warehouse/warehouse.entity';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

export const IWarehouseServiceKey = 'IWarehouseService';

export interface IWarehouseService {
    createWarehouse(
        name: string,
        location: string,
        city?: string,
        country?: string,
        capacity?: number,
        manager?: string,
        contactInfo?: string,
        status?: string
    ): Promise<Warehouse>;

    updateWarehouse(
        id: string,
        name?: string,
        location?: string,
        city?: string,
        country?: string,
        capacity?: number,
        manager?: string,
        contactInfo?: string,
        status?: string
    ): Promise<Warehouse>;
    deleteWarehouse(id: string): Promise<void>;
    getAllWarehouses(options?: IPaginationOptions, allowedIds?: string[], search?: string, status?: string): Promise<IPaginatedResult<Warehouse>>;
    getWarehouseById(id: string): Promise<Warehouse | null>;
    getWarehousesByUserId(userId: string): Promise<Warehouse[]>;
}
