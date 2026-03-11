import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IDashboardServiceKey } from '../../core/interfaces/services/dashboard.service.interface';
import type { IDashboardService } from '../../core/interfaces/services/dashboard.service.interface';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
    constructor(
        @Inject(IDashboardServiceKey)
        private readonly dashboardService: IDashboardService,
    ) {}

    @Get('summary')
    async getSummary() {
        return this.dashboardService.getSummary();
    }
}
