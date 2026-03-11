import {
    SalesKpi,
    SalesTrendItem,
    TopProductItem,
    InventoryKpi,
    InventoryByCategoryItem,
    CustomersKpi,
    CustomersByMonthItem,
    ReportPeriod,
} from '../services/report.service.interface';

export const IReportRepositoryKey = 'IReportRepository';

export interface IReportRepository {
    // Sales
    getSalesKpi(interval: string): Promise<SalesKpi>;
    getSalesTrend(months: number): Promise<SalesTrendItem[]>;
    getTopProducts(interval: string): Promise<TopProductItem[]>;

    // Inventory
    getInventoryKpi(): Promise<InventoryKpi>;
    getInventoryByCategory(): Promise<InventoryByCategoryItem[]>;

    // Customers
    getCustomersKpi(interval: string): Promise<CustomersKpi>;
    getCustomersByMonth(months: number): Promise<CustomersByMonthItem[]>;
}
