import { Controller, Post, Get, UseGuards, Request, Inject, Query, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../core/domain/enums/permission-code.enum';
import { PayrollServiceKey } from '../../core/interfaces/services/payroll.service.interface';
import type { IPayrollService } from '../../core/interfaces/services/payroll.service.interface';
import { PayrollMapper } from '../../application/mappers/payroll.mapper';

@Controller('payroll')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PayrollController {
    constructor(
        @Inject(PayrollServiceKey)
        private readonly service: IPayrollService
    ) {}

    // Admin: Calculate Salary for User
    @Post('calculate/:userId')
    @RequirePermissions(PermissionCode.SALARY_MANAGE)
    async calculateSalary(
        @Param('userId') userId: string,
        @Body() body: { month: number, year: number }
    ) {
        const payroll = await this.service.calculateMonthlySalary(userId, body.month, body.year);
        return PayrollMapper.toResponse(payroll);
    }

    // Admin: Get Payroll List
    @Get('list')
    @RequirePermissions(PermissionCode.SALARY_MANAGE)
    async getList(@Query('month', ParseIntPipe) month: number, @Query('year', ParseIntPipe) year: number) {
        console.log('--- Get Payroll List Request ---');
        console.log('Month:', month, 'Year:', year);
        const payrolls = await this.service.getMonthlyPayrollList(month, year);
        return payrolls.map(p => PayrollMapper.toResponse(p));
    }

    // User: Get My Payroll
    @Get('me')
    @RequirePermissions(PermissionCode.SALARY_VIEW_OWN)
    async getMyPayroll(@Request() req, @Query('month', ParseIntPipe) month: number, @Query('year', ParseIntPipe) year: number) {
        const payroll = await this.service.getPayroll(req.user.id, month, year);
        return payroll ? PayrollMapper.toResponse(payroll) : null;
    }
}
