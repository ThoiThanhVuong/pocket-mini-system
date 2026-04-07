import { Warehouse } from '../../../domain/entities/warehouse/warehouse.entity';
import { IBaseRepository } from '../base.repository.interface';

export interface IWarehouseRepository extends IBaseRepository<Warehouse> {
    findByName(name: string): Promise<Warehouse | null>;
    findByCode(code: string): Promise<Warehouse | null>;
    findWarehousesByUserId(userId: string): Promise<Warehouse[]>;
}
