import {
    DashboardKpi,
    MonthlyChartItem,
    RecentActivityItem,
} from '../services/dashboard.service.interface';

export const IDashboardRepositoryKey = 'IDashboardRepository';

export interface IDashboardRepository {
    getKpi(): Promise<DashboardKpi>;
    getMonthlyChart(): Promise<MonthlyChartItem[]>;
    getRecentActivity(): Promise<RecentActivityItem[]>;
    getLowStockCount(): Promise<number>;
}
