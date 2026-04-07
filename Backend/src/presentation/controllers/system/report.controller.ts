import { Controller, Get, Query, UseGuards, Inject, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import type { Response as ExpressResponse } from 'express';
import { IReportServiceKey } from '../../../core/interfaces/services/system/report.service.interface';
import type { IReportService, ReportPeriod } from '../../../core/interfaces/services/system/report.service.interface';
import { ExcelService } from '../../../application/use-cases/system/excel.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
    constructor(
        @Inject(IReportServiceKey)
        private readonly reportService: IReportService,
        private readonly excelService: ExcelService,
    ) {}

    @Get('sales')
    async getSalesReport(@Query('period') period = 'month') {
        return this.reportService.getSalesReport(period as ReportPeriod);
    }

    @Get('sales/export')
    async exportSalesReport(@Query('period') period = 'month', @Res() res: ExpressResponse) {
        const data = await this.reportService.getSalesReport(period as ReportPeriod);
        const columns = [
            { header: 'Tháng', key: 'month', width: 20 },
            { header: 'Tổng Xuất kho (VND)', key: 'revenue', width: 25 },
            { header: 'Tổng Nhập kho (VND)', key: 'cost', width: 25 },
        ];
        const buffer = await this.excelService.generateReport(`Báo cáo xuất nhập kho - ${period}`, columns, data.trend);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="Bao-cao-xuat-nhap-kho-${period}.xlsx"`,
        });
        res.send(buffer);
    }

    @Get('inventory')
    async getInventoryReport() {
        return this.reportService.getInventoryReport();
    }

    @Get('inventory/export')
    async exportInventoryReport(@Res() res: ExpressResponse) {
        const data = await this.reportService.getInventoryReport();
        const columns = [
            { header: 'Danh mục', key: 'name', width: 25 },
            { header: 'Còn hàng', key: 'inStock', width: 15 },
            { header: 'Sắp hết', key: 'lowStock', width: 15 },
            { header: 'Hết hàng', key: 'outOfStock', width: 15 },
        ];
        const buffer = await this.excelService.generateReport('Báo cáo tồn kho', columns, data.byCategory);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Bao-cao-ton-kho.xlsx"',
        });
        res.send(buffer);
    }

    @Get('customers')
    async getCustomersReport(@Query('period') period = 'month') {
        return this.reportService.getCustomersReport(period as ReportPeriod);
    }

    @Get('customers/export')
    async exportCustomersReport(@Query('period') period = 'month', @Res() res: ExpressResponse) {
        const data = await this.reportService.getCustomersReport(period as ReportPeriod);
        const columns = [
            { header: 'Tháng', key: 'month', width: 20 },
            { header: 'Khách hàng mới', key: 'newCustomers', width: 20 },
        ];
        const buffer = await this.excelService.generateReport(`Báo cáo khách hàng mới - ${period}`, columns, data.byMonth);
        
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="Bao-cao-khach-hang-${period}.xlsx"`,
        });
        res.send(buffer);
    }
}
