import api from '@/lib/axios';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

// ─── Sales ────────────────────────────────────────────────
export interface SalesKpi {
    totalRevenue: number;
    totalCost: number;
    totalOrders: number;
}
export interface SalesTrendItem {
    month: string;
    revenue: number;
    cost: number;
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

// ─── Profit ────────────────────────────────────────────────
export interface ProfitTrendItem {
    month: string;
    profit: number;
}
export interface ProfitReport {
    revenue: number;
    costOfGoods: number;
    grossProfit: number;
    trend: ProfitTrendItem[];
}

// ─── Inventory ────────────────────────────────────────────
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

// ─── Customers ────────────────────────────────────────────
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

// ─── Service ──────────────────────────────────────────────
export const ReportService = {
    async getSalesReport(period: ReportPeriod = 'month'): Promise<SalesReport> {
        const res = await api.get('/reports/sales', { params: { period } });
        return res.data.data;
    },
    async getProfitReport(period: ReportPeriod = 'month'): Promise<ProfitReport> {
        const res = await api.get('/reports/profit', { params: { period } });
        return res.data.data;
    },
    async getInventoryReport(): Promise<InventoryReport> {
        const res = await api.get('/reports/inventory');
        return res.data.data;
    },
    async getCustomersReport(period: ReportPeriod = 'month'): Promise<CustomersReport> {
        const res = await api.get('/reports/customers', { params: { period } });
        return res.data.data;
    },
    async exportSalesReport(period: ReportPeriod = 'month'): Promise<Blob> {
        const res = await api.get('/reports/sales/export', { params: { period }, responseType: 'blob' });
        return res.data;
    },
    async exportInventoryReport(): Promise<Blob> {
        const res = await api.get('/reports/inventory/export', { responseType: 'blob' });
        return res.data;
    },
    async exportCustomersReport(period: ReportPeriod = 'month'): Promise<Blob> {
        const res = await api.get('/reports/customers/export', { params: { period }, responseType: 'blob' });
        return res.data;
    },
    async getRevenueByCustomerReport(period: ReportPeriod = 'month'): Promise<CustomerRevenueItem[]> {
        const res = await api.get('/reports/revenue-by-customer', { params: { period } });
        return res.data.data;
    },
    async exportRevenueByCustomer(period: ReportPeriod = 'month'): Promise<Blob> {
        const res = await api.get('/reports/revenue-by-customer/export', { params: { period }, responseType: 'blob' });
        return res.data;
    },
};
