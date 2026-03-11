import { Controller, Get, Post, Body, Param, Query, UseGuards, Inject, Req, Res, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IStockInService } from '../../core/interfaces/services/stock-in.service.interface';
import { IStockInServiceKey } from '../../core/interfaces/services/stock-in.service.interface';
import { CreateStockInDto } from '../../application/dtos/inventory/stock-in.dto';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../core/domain/enums/permission-code.enum';
import { ExcelService } from '../../application/use-cases/excel.service';

@Controller('stock-in')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StockInController {
    constructor(
        @Inject(IStockInServiceKey)
        private readonly stockInService: IStockInService,
        private readonly excelService: ExcelService,
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
    @RequirePermissions(PermissionCode.STOCK_IN_CREATE)
    async create(@Body() dto: CreateStockInDto, @Req() req: any) {
        this.checkWarehouseAccess(req, dto.warehouseId);
        const userId = req.user.id;
        const stockIn = await this.stockInService.createStockIn(
            dto.supplierId, dto.warehouseId, userId, dto.referenceCode, dto.items, dto.notes,
        );
        return {
            id: stockIn.id,
            supplierId: stockIn.supplierId,
            warehouseId: stockIn.warehouseId,
            referenceCode: stockIn.referenceCode,
            status: stockIn.status,
            items: stockIn.items.map(i => ({
                id: i.id,
                productId: i.productId,
                quantity: i.quantity,
                price: i.price,
            })),
            totalAmount: stockIn.calculateTotalAmount(),
            createdAt: stockIn.createdAt,
        };
    }

    @Post(':id/approve')
    @RequirePermissions(PermissionCode.STOCK_IN_APPROVE)
    async approve(@Param('id') id: string, @Req() req: any) {
        const existing = await this.stockInService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu nhập');
        this.checkWarehouseAccess(req, existing.warehouseId);

        const stockIn = await this.stockInService.approveStockIn(id);
        return { id: stockIn.id, status: stockIn.status, message: 'Phiếu nhập đã được duyệt. Tồn kho đã cập nhật.' };
    }

    @Post(':id/complete')
    @RequirePermissions(PermissionCode.STOCK_IN_COMPLETE)
    async complete(@Param('id') id: string, @Req() req: any) {
        const existing = await this.stockInService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu nhập');
        this.checkWarehouseAccess(req, existing.warehouseId);

        const stockIn = await this.stockInService.completeStockIn(id);
        return { id: stockIn.id, status: stockIn.status, message: 'Phiếu nhập đã hoàn thành.' };
    }

    @Post(':id/cancel')
    @RequirePermissions(PermissionCode.STOCK_IN_CANCEL)
    async cancel(@Param('id') id: string, @Req() req: any) {
        const existing = await this.stockInService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu nhập');
        this.checkWarehouseAccess(req, existing.warehouseId);

        const stockIn = await this.stockInService.cancelStockIn(id);
        return { id: stockIn.id, status: stockIn.status, message: 'Phiếu nhập đã bị hủy.' };
    }

    @Get('export')
    @RequirePermissions(PermissionCode.STOCK_IN_VIEW)
    async exportData(@Req() req: any, @Res() res: any, @Query('warehouseId') warehouseId?: string, @Query('status') status?: string) {
        const data = await this.findAll(req, warehouseId, status);
        const columns = [
            { header: 'Mã phiếu', key: 'referenceCode', width: 20 },
            { header: 'Nhà cung cấp', key: 'supplierName', width: 30 },
            { header: 'Kho', key: 'warehouseName', width: 25 },
            { header: 'Trạng thái', key: 'status', width: 15 },
            { header: 'Tổng tiền', key: 'totalAmount', width: 20 },
            { header: 'Ngày tạo', key: 'createdAt', width: 25 },
        ];
        
        const formattedData = data.map(item => ({
            ...item,
            totalAmount: item.totalAmount.toLocaleString('vi-VN') + ' đ',
            createdAt: new Date(item.createdAt).toLocaleString('vi-VN')
        }));

        const buffer = await this.excelService.generateReport('Danh Sách Phiếu Nhập', columns, formattedData);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="ds-phieu-nhap.xlsx"');
        res.send(buffer);
    }

    @Get()
    @RequirePermissions(PermissionCode.STOCK_IN_VIEW)
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

        const list = await this.stockInService.getAll(warehouseId, status);
        return list.map(s => ({
            id: s.id,
            supplierId: s.supplierId,
            supplierName: (s as any).supplierName || '',
            warehouseId: s.warehouseId,
            warehouseName: (s as any).warehouseName || '',
            referenceCode: s.referenceCode,
            status: s.status,
            totalAmount: s.calculateTotalAmount(),
            createdAt: s.createdAt,
            items: s.items.map(i => ({
                id: i.id,
                productId: i.productId,
                productName: (i as any).productName || '',
                quantity: i.quantity,
                price: i.price,
            })),
        }));
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.STOCK_IN_VIEW)
    async findOne(@Param('id') id: string, @Req() req: any) {
        const s = await this.stockInService.getById(id);
        if (!s) return { message: 'StockIn not found' };
        this.checkWarehouseAccess(req, s.warehouseId);
        return {
            id: s.id,
            supplierId: s.supplierId,
            warehouseId: s.warehouseId,
            referenceCode: s.referenceCode,
            status: s.status,
            items: s.items.map(i => ({
                id: i.id,
                productId: i.productId,
                quantity: i.quantity,
                price: i.price,
            })),
            totalAmount: s.calculateTotalAmount(),
            createdAt: s.createdAt,
        };
    }
}
