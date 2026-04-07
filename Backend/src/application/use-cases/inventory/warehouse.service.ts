import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Warehouse } from '../../../core/domain/entities/warehouse/warehouse.entity';
import type { IWarehouseRepository } from '../../../core/interfaces/repositories/inventory/warehouse.repository.interface';
import type { IStockRepository } from '../../../core/interfaces/repositories/inventory/stock.repository.interface';
import { IWarehouseService } from '../../../core/interfaces/services/inventory/warehouse.service.interface';

export const IWarehouseRepositoryKey = 'IWarehouseRepository';

@Injectable()
export class WarehouseService implements IWarehouseService {
    constructor(
        @Inject(IWarehouseRepositoryKey)
        private readonly warehouseRepo: IWarehouseRepository,
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
    ) {}

    async createWarehouse(
        name: string,
        location: string,
        city?: string,
        country?: string,
        capacity?: number,
        manager?: string,
        contactInfo?: string,
        status?: string
    ): Promise<Warehouse> {
        const warehouse = new Warehouse(
            uuidv4(), name, location, city, country, capacity, manager, contactInfo, status || 'ACTIVE', new Date()
        );
        return this.warehouseRepo.save(warehouse);
    }

    async updateWarehouse(
        id: string,
        name?: string,
        location?: string,
        city?: string,
        country?: string,
        capacity?: number,
        manager?: string,
        contactInfo?: string,
        status?: string
    ): Promise<Warehouse> {
        const warehouse = await this.warehouseRepo.findOneById(id);
        if (!warehouse) throw new NotFoundException(`Warehouse #${id} not found`);
        if (name) warehouse.name = name;
        if (location) warehouse.location = location;
        if (city !== undefined) warehouse.city = city;
        if (country !== undefined) warehouse.country = country;
        if (capacity !== undefined) warehouse.capacity = capacity;
        if (manager !== undefined) warehouse.manager = manager;
        if (contactInfo !== undefined) warehouse.contactInfo = contactInfo;
        if (status !== undefined) warehouse.status = status;
        
        return this.warehouseRepo.save(warehouse);
    }

    async deleteWarehouse(id: string): Promise<void> {
        const warehouse = await this.warehouseRepo.findOneById(id);
        if (!warehouse) throw new NotFoundException(`Warehouse #${id} not found`);

        // #2: Kiểm tra kho còn hàng không trước khi ngừng hoạt động
        const stockItems = await this.stockRepo.findByWarehouse(id);
        const hasStock = stockItems.some(s => s.quantity > 0);
        if (hasStock) {
            throw new BadRequestException(
                `Không thể ngừng hoạt động kho "${warehouse.name}" vì vẫn còn hàng tồn kho. Hãy chuyển hết hàng sang kho khác trước.`
            );
        }

        warehouse.status = 'Inactive';
        await this.warehouseRepo.save(warehouse);
    }

    async getAllWarehouses(): Promise<Warehouse[]> {
        return this.warehouseRepo.findAll();
    }

    async getWarehouseById(id: string): Promise<Warehouse | null> {
        return this.warehouseRepo.findOneById(id);
    }

    async getWarehousesByUserId(userId: string): Promise<Warehouse[]> {
        return this.warehouseRepo.findWarehousesByUserId(userId);
    }
}
