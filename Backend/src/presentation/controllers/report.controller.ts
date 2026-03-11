import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IReportServiceKey } from '../../core/interfaces/services/report.service.interface';
import type { IReportService, ReportPeriod } from '../../core/interfaces/services/report.service.interface';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
    constructor(
        @Inject(IReportServiceKey)
        private readonly reportService: IReportService,
    ) {}

    @Get('sales')
    async getSalesReport(@Query('period') period = 'month') {
        return this.reportService.getSalesReport(period as ReportPeriod);
    }

    @Get('inventory')
    async getInventoryReport() {
        return this.reportService.getInventoryReport();
    }

    @Get('customers')
    async getCustomersReport(@Query('period') period = 'month') {
        return this.reportService.getCustomersReport(period as ReportPeriod);
    }
}
