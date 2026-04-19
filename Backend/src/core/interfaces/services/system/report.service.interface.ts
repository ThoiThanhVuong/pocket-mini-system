export const IReportServiceKey = 'IReportService';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

// ─── Sales Report ────────────────────────────────────────────────────────────
export interface SalesKpi {
    totalRevenue: number;
    totalCost: number;
    totalOrders: number;       // total stock-out orders
}

export interface SalesTrendItem {
    month: string;
    revenue: number;           // total stock-out value
    cost: number;              // total stock-in value
}

export interface TopProductItem {
    name: string;
    quantity: number;
    revenue: number;
}

export interface SalesReport {
    kpi: SalesKpi;
    trend: SalesTrendItem[];
    topProducts: TopProductItem[];
}

// ─── Inventory Report ─────────────────────────────────────────────────────────
export interface InventoryKpi {
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
}

export interface InventoryByCategoryItem {
    name: string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
}

export interface InventoryReport {
    kpi: InventoryKpi;
    byCategory: InventoryByCategoryItem[];
}

// ─── Customers Report ─────────────────────────────────────────────────────────
export interface CustomersKpi {
    totalCustomers: number;
    newThisPeriod: number;
}

export interface CustomersByMonthItem {
    month: string;
    newCustomers: number;
}

export interface CustomersReport {
    kpi: CustomersKpi;
    byMonth: CustomersByMonthItem[];
}

export interface CustomerRevenueItem {
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalRevenue: number;
}

// ─── Service Interface ─────────────────────────────────────────────────────────
export interface IReportService {
    getSalesReport(period: ReportPeriod): Promise<SalesReport>;
    getInventoryReport(): Promise<InventoryReport>;
    getCustomersReport(period: ReportPeriod): Promise<CustomersReport>;
    getRevenueByCustomerReport(period: ReportPeriod): Promise<CustomerRevenueItem[]>;
}
