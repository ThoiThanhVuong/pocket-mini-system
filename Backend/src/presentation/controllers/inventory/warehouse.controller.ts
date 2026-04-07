import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { IWarehouseServiceKey } from '../../../core/interfaces/services/inventory/warehouse.service.interface';
import type { IWarehouseService } from '../../../core/interfaces/services/inventory/warehouse.service.interface';
import type { IStockRepository } from '../../../core/interfaces/repositories/inventory/stock.repository.interface';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../../../application/dtos/inventory/warehouse.dto';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';

@Controller('warehouses')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class WarehouseController {
    constructor(
        @Inject(IWarehouseServiceKey)
        private readonly warehouseService: IWarehouseService,
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
    ) {}

    @Post()
    @RequirePermissions(PermissionCode.WAREHOUSE_CREATE)
    async create(@Body() dto: CreateWarehouseDto) {
        const warehouse = await this.warehouseService.createWarehouse(
            dto.name, dto.location, dto.city, dto.country, dto.capacity, dto.manager, dto.contactInfo, dto.status
        );
        return { 
            id: warehouse.id, 
            name: warehouse.name, 
            location: warehouse.location, 
            city: warehouse.city,
            country: warehouse.country,
            capacity: warehouse.capacity,
            manager: warehouse.manager,
            contactInfo: warehouse.contactInfo,
            status: warehouse.status,
            createdAt: warehouse.createdAt 
        };
    }

    @Get()
    @RequirePermissions(PermissionCode.WAREHOUSE_VIEW)
    async findAll(@Req() req: any, @Query('all') all?: string) {
        const roleCodes = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = roleCodes.some(r => r === 'admin' || r === 'system_admin' || r?.includes('admin'));
        const userWarehouseIds = req.user.warehouseIds || [];

        let list = await this.warehouseService.getAllWarehouses();
        
        if (!isSystemAdmin && all !== 'true') {
            list = list.filter(w => userWarehouseIds.includes(w.id));
        }

        const result = await Promise.all(list.map(async w => {
            const stockItems = await this.stockRepo.findByWarehouse(w.id);
            const currentStock = stockItems.reduce((sum, s) => sum + s.quantity, 0);
            return {
                id: w.id,
                name: w.name,
                location: w.location,
                city: w.city,
                country: w.country,
                capacity: w.capacity,
                currentStock,
                manager: w.manager,
                contactInfo: w.contactInfo,
                status: w.status,
                createdAt: w.createdAt
            };
        }));
        return result;
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.WAREHOUSE_VIEW)
    async findOne(@Param('id') id: string, @Req() req: any) {
        const roleCodes = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = roleCodes.some(r => r === 'admin' || r === 'system_admin' || r?.includes('admin'));
        const userWarehouseIds = req.user.warehouseIds || [];
        
        if (!isSystemAdmin && !userWarehouseIds.includes(id)) {
            throw new ForbiddenException('Bạn không có quyền xem kho này');
        }

        const w = await this.warehouseService.getWarehouseById(id);
        if (!w) return { message: 'Warehouse not found' };
        const stockItems = await this.stockRepo.findByWarehouse(id);
        const currentStock = stockItems.reduce((sum, s) => sum + s.quantity, 0);
        return {
            id: w.id,
            name: w.name,
            location: w.location,
            city: w.city,
            country: w.country,
            capacity: w.capacity,
            currentStock,
            manager: w.manager,
            contactInfo: w.contactInfo,
            status: w.status,
            createdAt: w.createdAt
        };
    }

    @Put(':id')
    @RequirePermissions(PermissionCode.WAREHOUSE_UPDATE)
    async update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
        const w = await this.warehouseService.updateWarehouse(
            id, dto.name, dto.location, dto.city, dto.country, dto.capacity, dto.manager, dto.contactInfo, dto.status
        );
        return { 
            id: w.id, 
            name: w.name, 
            location: w.location, 
            city: w.city,
            country: w.country,
            capacity: w.capacity,
            manager: w.manager,
            contactInfo: w.contactInfo,
            status: w.status,
            createdAt: w.createdAt 
        };
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.WAREHOUSE_DELETE)
    async delete(@Param('id') id: string) {
        await this.warehouseService.deleteWarehouse(id);
        return { message: 'Warehouse deleted successfully' };
    }
}
