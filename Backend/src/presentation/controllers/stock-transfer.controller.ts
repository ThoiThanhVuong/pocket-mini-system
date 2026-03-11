import { Controller, Get, Post, Body, Param, Query, UseGuards, Inject, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IStockTransferService } from '../../core/interfaces/services/stock-transfer.service.interface';
import { IStockTransferServiceKey } from '../../core/interfaces/services/stock-transfer.service.interface';
import { CreateStockTransferDto } from '../../application/dtos/inventory/stock-transfer.dto';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../core/domain/enums/permission-code.enum';

@Controller('stock-transfer')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StockTransferController {
    constructor(
        @Inject(IStockTransferServiceKey)
        private readonly transferService: IStockTransferService,
    ) {}

    private checkWarehouseAccess(req: any, warehouseId: string) {
        const roleCodes = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = roleCodes.some(r => r === 'admin' || r === 'system_admin' || r?.includes('admin'));
        const userWarehouseIds = req.user.warehouseIds || [];

        if (!isSystemAdmin && !userWarehouseIds.includes(warehouseId)) {
            throw new ForbiddenException('Bạn không có quyền thao tác trên kho này');
        }
    }

    @Post()
    @RequirePermissions(PermissionCode.STOCK_TRANSFER_CREATE)
    async create(@Body() dto: CreateStockTransferDto, @Req() req: any) {
        this.checkWarehouseAccess(req, dto.fromWarehouseId);
        const userId = req.user.id;
        const transfer = await this.transferService.createTransfer(
            dto.fromWarehouseId, dto.toWarehouseId, userId, dto.referenceCode, dto.items, dto.notes,
        );
        return {
            id: transfer.id,
            fromWarehouseId: transfer.fromWarehouseId,
            toWarehouseId: transfer.toWarehouseId,
            referenceCode: transfer.referenceCode,
            status: transfer.status,
            items: transfer.items.map(i => ({
                id: i.id,
                productId: i.productId,
                quantity: i.quantity,
            })),
            createdAt: transfer.createdAt,
        };
    }

    @Post(':id/approve')
    @RequirePermissions(PermissionCode.STOCK_TRANSFER_APPROVE)
    async approve(@Param('id') id: string, @Req() req: any) {
        const existing = await this.transferService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu điều chuyển');
        this.checkWarehouseAccess(req, existing.toWarehouseId); // Approver usually checks toWarehouseId since they receive it

        const transfer = await this.transferService.approveTransfer(id);
        return {
            id: transfer.id,
            status: transfer.status,
            message: 'Phiếu điều chuyển đã được duyệt. Tồn kho đã cập nhật giữa 2 kho.',
        };
    }

    @Post(':id/complete')
    @RequirePermissions(PermissionCode.STOCK_TRANSFER_COMPLETE)
    async complete(@Param('id') id: string, @Req() req: any) {
        const existing = await this.transferService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu điều chuyển');
        this.checkWarehouseAccess(req, existing.toWarehouseId);

        const transfer = await this.transferService.completeTransfer(id);
        return { id: transfer.id, status: transfer.status, message: 'Phiếu điều chuyển đã hoàn thành.' };
    }

    @Post(':id/cancel')
    @RequirePermissions(PermissionCode.STOCK_TRANSFER_CANCEL)
    async cancel(@Param('id') id: string, @Req() req: any) {
        const existing = await this.transferService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu điều chuyển');
        this.checkWarehouseAccess(req, existing.fromWarehouseId); // Canceler is usually from fromWarehouseId

        const transfer = await this.transferService.cancelTransfer(id);
        return { id: transfer.id, status: transfer.status, message: 'Phiếu điều chuyển đã bị hủy.' };
    }

    @Get()
    @RequirePermissions(PermissionCode.STOCK_TRANSFER_VIEW)
    async findAll(@Req() req: any, @Query('warehouseId') warehouseId?: string, @Query('status') status?: string) {
        const userRoles = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = userRoles.includes('admin') || userRoles.includes('system_admin');
        const userWarehouseIds = req.user.warehouseIds || [];

        if (!isSystemAdmin) {
            if (!warehouseId) {
                if (userWarehouseIds.length === 1) {
                    warehouseId = userWarehouseIds[0];
                } else if (userWarehouseIds.length > 1) {
                    throw new ForbiddenException('Vui lòng chọn kho cụ thể để xem danh sách');
                } else {
                    return [];
                }
            } else {
                if (!userWarehouseIds.includes(warehouseId)) {
                    throw new ForbiddenException('Bạn không có quyền xem kho này');
                }
            }
        }

        const list = await this.transferService.getAll(warehouseId, status);
        return list.map(t => ({
            id: t.id,
            fromWarehouseId: t.fromWarehouseId,
            fromWarehouseName: (t as any).fromWarehouseName || '',
            toWarehouseId: t.toWarehouseId,
            toWarehouseName: (t as any).toWarehouseName || '',
            referenceCode: t.referenceCode,
            status: t.status,
            itemCount: t.items.length,
            createdAt: t.createdAt,
            items: t.items.map(i => ({
                id: i.id,
                productId: i.productId,
                productName: (i as any).productName || '',
                quantity: i.quantity,
            })),
        }));
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.STOCK_TRANSFER_VIEW)
    async findOne(@Param('id') id: string, @Req() req: any) {
        const t = await this.transferService.getById(id);
        if (!t) return { message: 'StockTransfer not found' };
        
        const userRoles = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = userRoles.includes('admin') || userRoles.includes('system_admin');
        const userWarehouseIds = req.user.warehouseIds || [];
        
        if (!isSystemAdmin && !userWarehouseIds.includes(t.fromWarehouseId) && !userWarehouseIds.includes(t.toWarehouseId)) {
             throw new ForbiddenException('Bạn không có quyền xem phiếu điều chuyển này');
        }
        return {
            id: t.id,
            fromWarehouseId: t.fromWarehouseId,
            toWarehouseId: t.toWarehouseId,
            referenceCode: t.referenceCode,
            status: t.status,
            items: t.items.map(i => ({
                id: i.id,
                productId: i.productId,
                quantity: i.quantity,
            })),
            createdAt: t.createdAt,
        };
    }
}
