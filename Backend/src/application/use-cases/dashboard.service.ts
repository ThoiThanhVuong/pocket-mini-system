import { Injectable, Inject } from '@nestjs/common';
import { IDashboardRepositoryKey } from '../../core/interfaces/repositories/dashboard.repository.interface';
import type { IDashboardRepository } from '../../core/interfaces/repositories/dashboard.repository.interface';
import type { IDashboardService, DashboardSummary } from '../../core/interfaces/services/dashboard.service.interface';

@Injectable()
export class DashboardService implements IDashboardService {
    constructor(
        @Inject(IDashboardRepositoryKey)
        private readonly dashboardRepo: IDashboardRepository,
    ) {}

    async getSummary(): Promise<DashboardSummary> {
        const [kpi, monthlyChart, recentActivity, lowStock] = await Promise.all([
            this.dashboardRepo.getKpi(),
            this.dashboardRepo.getMonthlyChart(),
            this.dashboardRepo.getRecentActivity(),
            this.dashboardRepo.getLowStockCount(),
        ]);
        return { kpi, monthlyChart, recentActivity, lowStock };
    }
}
