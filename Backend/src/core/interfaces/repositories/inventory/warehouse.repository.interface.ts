import { Warehouse } from '../../../domain/entities/warehouse/warehouse.entity';
import { IBaseRepository } from '../base.repository.interface';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

export interface IWarehouseRepository extends IBaseRepository<Warehouse> {
    findByName(name: string): Promise<Warehouse | null>;
    findByCode(code: string): Promise<Warehouse | null>;
    findWarehousesByUserId(userId: string): Promise<Warehouse[]>;
    findAllPaginated(options?: IPaginationOptions, allowedIds?: string[], search?: string, status?: string): Promise<IPaginatedResult<Warehouse>>;
}
