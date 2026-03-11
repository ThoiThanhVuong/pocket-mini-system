import { Controller, Get, Param, Query, UseGuards, Inject, Req, Res, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IStockService } from '../../core/interfaces/services/stock.service.interface';
import { IStockServiceKey } from '../../core/interfaces/services/stock.service.interface';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../core/domain/enums/permission-code.enum';
import { ExcelService } from '../../application/use-cases/excel.service';

@Controller('stock')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StockController {
    constructor(
        @Inject(IStockServiceKey)
        private readonly stockService: IStockService,
        private readonly excelService: ExcelService,
    ) {}

    private enforceWarehouseAccess(req: any, warehouseId?: string): string {
        const roleCodes = (req.user.roles || []).map((r: any) => (r.roleCode as string)?.toLowerCase());
        const isSystemAdmin = roleCodes.some(r => r === 'admin' || r === 'system_admin' || r?.includes('admin'));
        const userWarehouseIds = req.user.warehouseIds || [];

        if (isSystemAdmin) return warehouseId || '';

        if (!warehouseId) {
            if (userWarehouseIds.length === 1) return userWarehouseIds[0];
            throw new ForbiddenException('Vui lòng chọn kho cụ thể');
        }

        if (!userWarehouseIds.includes(warehouseId)) {
            throw new ForbiddenException('Bạn không có quyền xem kho này');
        }
        return warehouseId;
    }

    @Get('export')
    @RequirePermissions(PermissionCode.STOCK_VIEW)
    async exportData(@Req() req: any, @Res() res: any, @Query('warehouseId') warehouseId?: string) {
        warehouseId = this.enforceWarehouseAccess(req, warehouseId);
        
        let data: any[] = [];
        if (warehouseId) {
            data = await this.stockService.getDetailedStock(warehouseId);
        } else {
            data = await this.stockService.getDetailedStock();
        }

        const columns = [
            { header: 'Kho', key: 'warehouseName', width: 25 },
            { header: 'Mã SKU', key: 'productSku', width: 20 },
            { header: 'Tên Sản phẩm', key: 'productName', width: 35 },
            { header: 'Số lượng', key: 'quantity', width: 15 },
        ];

        const buffer = await this.excelService.generateReport('Báo Cáo Tồn Kho', columns, data);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="bao-cao-ton-kho.xlsx"');
        res.send(buffer);
    }

    @Get()
    @RequirePermissions(PermissionCode.STOCK_VIEW)
    async getStock(
        @Req() req: any,
        @Query('warehouseId') warehouseId?: string,
        @Query('productId') productId?: string,
    ) {
        warehouseId = this.enforceWarehouseAccess(req, warehouseId);

        if (warehouseId && productId) {
            const item = await this.stockService.getStockItem(warehouseId, productId);
            return item ? { warehouseId: item.warehouseId, productId: item.productId, quantity: item.quantity } : { message: 'No stock found' };
        }
        if (warehouseId) {
            const list = await this.stockService.getStockByWarehouse(warehouseId);
            return list.map(s => ({ warehouseId: s.warehouseId, productId: s.productId, quantity: s.quantity }));
        }
        if (productId) {
            const list = await this.stockService.getStockByProduct(productId);
            return list.map(s => ({ warehouseId: s.warehouseId, productId: s.productId, quantity: s.quantity }));
        }
        return { message: 'Provide warehouseId or productId query parameter' };
    }

    @Get('low-stock')
    @RequirePermissions(PermissionCode.STOCK_VIEW)
    async getLowStock(@Req() req: any, @Query('warehouseId') warehouseId?: string) {
        warehouseId = this.enforceWarehouseAccess(req, warehouseId);
        if (!warehouseId) return { message: 'warehouseId is required' };
        const list = await this.stockService.getLowStock(warehouseId);
        return list.map(s => ({ warehouseId: s.warehouseId, productId: s.productId, quantity: s.quantity }));
    }

    /** Tổng tồn kho 1 product trên tất cả kho */
    @Get('total/:productId')
    @RequirePermissions(PermissionCode.STOCK_VIEW)
    async getTotalStock(@Req() req: any, @Param('productId') productId: string) {
        const userRoles = req.user.roles || [];
        const isSystemAdmin = userRoles.includes('admin') || userRoles.includes('system_admin');
        if (!isSystemAdmin) {
            throw new ForbiddenException('Chỉ admin mới có quyền xem tổng tồn kho trên tất cả các kho');
        }
        const total = await this.stockService.getTotalStockByProduct(productId);
        return { productId, totalQuantity: total };
    }
}

