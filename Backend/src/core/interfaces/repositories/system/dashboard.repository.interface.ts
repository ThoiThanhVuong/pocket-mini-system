import {
    DashboardKpi,
    MonthlyChartItem,
    RecentActivityItem,
} from '../../services/system/dashboard.service.interface';

export const IDashboardRepositoryKey = 'IDashboardRepository';

export interface IDashboardRepository {
    getKpi(): Promise<DashboardKpi>;
    getMonthlyChart(): Promise<MonthlyChartItem[]>;
    getRecentActivity(): Promise<RecentActivityItem[]>;
    getLowStockCount(): Promise<number>;
}
