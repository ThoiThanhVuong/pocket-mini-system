import api from '@/lib/axios';

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
    type: 'stock_in' | 'stock_out' | 'stock_transfer';
    code: string;
    status: string;
    createdAt: string;
    description: string;
}

export interface DashboardSummary {
    kpi: DashboardKpi;
    monthlyChart: MonthlyChartItem[];
    recentActivity: RecentActivityItem[];
    lowStock: number;
}

export const DashboardService = {
    async getSummary(): Promise<DashboardSummary> {
        const res = await api.get('/dashboard/summary');
        return res.data.data || res.data;
    }
};
