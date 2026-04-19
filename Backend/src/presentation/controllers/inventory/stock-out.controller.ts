import { Controller, Get, Post, Body, Param, Query, UseGuards, Inject, Req, Res, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IStockOutService } from '../../../core/interfaces/services/inventory/stock-out.service.interface';
import { IStockOutServiceKey } from '../../../core/interfaces/services/inventory/stock-out.service.interface';
import { CreateStockOutDto } from '../../../application/dtos/inventory/stock-out.dto';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';
import { ExcelService } from '../../../application/use-cases/system/excel.service';

@Controller('stock-out')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StockOutController {
    constructor(
        @Inject(IStockOutServiceKey)
        private readonly stockOutService: IStockOutService,
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
    @RequirePermissions(PermissionCode.STOCK_OUT_CREATE)
    async create(@Body() dto: CreateStockOutDto, @Req() req: any) {
        this.checkWarehouseAccess(req, dto.warehouseId);
        const userId = req.user.id;
        const stockOut = await this.stockOutService.createStockOut(
            dto.customerId, dto.warehouseId, userId, dto.referenceCode, dto.items, dto.notes,
        );
        return {
            id: stockOut.id,
            customerId: stockOut.customerId,
            warehouseId: stockOut.warehouseId,
            referenceCode: stockOut.referenceCode,
            status: stockOut.status,
            items: stockOut.items.map(i => ({
                id: i.id,
                productId: i.productId,
                quantity: i.quantity,
                price: i.price,
            })),
            totalAmount: stockOut.calculateTotalAmount(),
            createdAt: stockOut.createdAt,
        };
    }

    @Post(':id/approve')
    @RequirePermissions(PermissionCode.STOCK_OUT_APPROVE)
    async approve(@Param('id') id: string, @Req() req: any) {
        const existing = await this.stockOutService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu xuất');
        this.checkWarehouseAccess(req, existing.warehouseId);

        const stockOut = await this.stockOutService.approveStockOut(id);
        return { id: stockOut.id, status: stockOut.status, message: 'Phiếu xuất đã được duyệt. Tồn kho đã trừ.' };
    }

    @Post(':id/complete')
    @RequirePermissions(PermissionCode.STOCK_OUT_COMPLETE)
    async complete(@Param('id') id: string, @Req() req: any) {
        const existing = await this.stockOutService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu xuất');
        this.checkWarehouseAccess(req, existing.warehouseId);

        const stockOut = await this.stockOutService.completeStockOut(id);
        return { id: stockOut.id, status: stockOut.status, message: 'Phiếu xuất đã hoàn thành. Giao hàng thành công.' };
    }

    @Post(':id/cancel')
    @RequirePermissions(PermissionCode.STOCK_OUT_CANCEL)
    async cancel(@Param('id') id: string, @Req() req: any) {
        const existing = await this.stockOutService.getById(id);
        if (!existing) throw new NotFoundException('Không tìm thấy phiếu xuất');
        this.checkWarehouseAccess(req, existing.warehouseId);

        const stockOut = await this.stockOutService.cancelStockOut(id);
        return { id: stockOut.id, status: stockOut.status, message: 'Phiếu xuất đã bị hủy.' };
    }

    @Get('export')
    @RequirePermissions(PermissionCode.STOCK_OUT_VIEW)
    async exportData(@Req() req: any, @Res() res: any, @Query('warehouseId') warehouseId?: string, @Query('status') status?: string) {
        const data = await this.findAll(req, warehouseId, status);
        const columns = [
            { header: 'Mã phiếu', key: 'referenceCode', width: 20 },
            { header: 'Khách hàng', key: 'customerName', width: 30 },
            { header: 'Kho', key: 'warehouseName', width: 25 },
            { header: 'Trạng thái', key: 'status', width: 15 },
            { header: 'Tổng tiền', key: 'totalAmount', width: 20 },
            { header: 'Ngày tạo', key: 'createdAt', width: 25 },
        ];
        
        const formattedData = data.items.map(item => ({
            ...item,
            totalAmount: item.totalAmount.toLocaleString('vi-VN') + ' đ',
            createdAt: new Date(item.createdAt).toLocaleString('vi-VN')
        }));

        const buffer = await this.excelService.generateReport('Danh Sách Phiếu Xuất', columns, formattedData);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="ds-phieu-xuat.xlsx"');
        res.send(buffer);
    }

    @Get()
    @RequirePermissions(PermissionCode.STOCK_OUT_VIEW)
    async findAll(
        @Req() req: any, 
        @Query('warehouseId') warehouseId?: string, 
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
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
                    return { items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit || 12, totalPages: 0, currentPage: page || 1 } };
                }
            } else {
                if (!userWarehouseIds.includes(warehouseId)) {
                    throw new ForbiddenException('Bạn không có quyền xem kho này');
                }
            }
        }

        const result = await this.stockOutService.getAll(
            { warehouseId, status, search },
            { page: page ? Number(page) : 1, limit: limit ? Number(limit) : 12 }
        );

        return {
            items: result.items.map(s => ({
                id: s.id,
                customerId: s.customerId,
                customerName: (s as any).customerName || '',
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
            })),
            meta: result.meta
        };
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.STOCK_OUT_VIEW)
    async findOne(@Param('id') id: string, @Req() req: any) {
        const s = await this.stockOutService.getById(id);
        if (!s) return { message: 'StockOut not found' };
        this.checkWarehouseAccess(req, s.warehouseId);
        return {
            id: s.id,
            customerId: s.customerId,
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

    @Get('customer/:customerId')
    @RequirePermissions(PermissionCode.STOCK_OUT_VIEW)
    async findByCustomer(@Param('customerId') customerId: string, @Req() req: any) {
        const list = await this.stockOutService.getByCustomer(customerId);
        // Map to response dto
        return list.map(s => ({
            id: s.id,
            customerId: s.customerId,
            customerName: (s as any).customerName || '',
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
}
