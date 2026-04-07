export const IDashboardServiceKey = 'IDashboardService';

export interface DashboardKpi {
    totalRevenue: number;
    totalProducts: number;
    totalStockIns: number;
    totalCustomers: number;
    pendingStockOuts: number;
}

export interface MonthlyChartItem {
    month: string;
    stockIn: number;
    stockOut: number;
}

export interface RecentActivityItem {
    type: string;
    code: string;
    status: string;
    createdAt: Date;
    description: string;
}

export interface DashboardSummary {
    kpi: DashboardKpi;
    monthlyChart: MonthlyChartItem[];
    recentActivity: RecentActivityItem[];
    lowStock: number;
}

export interface IDashboardService {
    getSummary(): Promise<DashboardSummary>;
}
