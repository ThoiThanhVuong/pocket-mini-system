import { Injectable, Inject } from '@nestjs/common';
import { IReportRepositoryKey } from '../../../core/interfaces/repositories/system/report.repository.interface';
import type { IReportRepository } from '../../../core/interfaces/repositories/system/report.repository.interface';
import type {
    IReportService, ReportPeriod,
    SalesReport, InventoryReport, CustomersReport, CustomerRevenueItem
} from '../../../core/interfaces/services/system/report.service.interface';

function periodInterval(period: ReportPeriod): string {
    switch (period) {
        case 'week':    return '7 days';
        case 'month':   return '1 month';
        case 'quarter': return '3 months';
        case 'year':    return '1 year';
        default:        return '1 month';
    }
}

function periodMonths(period: ReportPeriod): number {
    switch (period) {
        case 'week':    return 1;
        case 'month':   return 6;
        case 'quarter': return 3;
        case 'year':    return 12;
        default:        return 6;
    }
}

@Injectable()
export class ReportService implements IReportService {
    constructor(
        @Inject(IReportRepositoryKey)
        private readonly reportRepo: IReportRepository,
    ) {}

    async getSalesReport(period: ReportPeriod): Promise<SalesReport> {
        const interval = periodInterval(period);
        const months   = periodMonths(period);
        const [kpi, trend, topProducts] = await Promise.all([
            this.reportRepo.getSalesKpi(interval),
            this.reportRepo.getSalesTrend(months),
            this.reportRepo.getTopProducts(interval),
        ]);
        return { kpi, trend, topProducts };
    }

    async getInventoryReport(): Promise<InventoryReport> {
        const [kpi, byCategory] = await Promise.all([
            this.reportRepo.getInventoryKpi(),
            this.reportRepo.getInventoryByCategory(),
        ]);
        return { kpi, byCategory };
    }

    async getCustomersReport(period: ReportPeriod): Promise<CustomersReport> {
        const interval = periodInterval(period);
        const months   = periodMonths(period);
        const [kpi, byMonth] = await Promise.all([
            this.reportRepo.getCustomersKpi(interval),
            this.reportRepo.getCustomersByMonth(months),
        ]);
        return { kpi, byMonth };
    }

    async getRevenueByCustomerReport(period: ReportPeriod): Promise<CustomerRevenueItem[]> {
        const interval = periodInterval(period);
        return this.reportRepo.getRevenueByCustomer(interval);
    }
}
