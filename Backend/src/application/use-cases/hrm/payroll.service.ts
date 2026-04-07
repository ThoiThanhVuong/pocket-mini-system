import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IPayrollService } from '../../../core/interfaces/services/hrm/payroll.service.interface';
import type { IPayrollRepository } from '../../../core/interfaces/repositories/hrm/payroll.repository.interface';
import { Payroll, PayrollStatus } from '../../../core/domain/entities/hrm/payroll.entity';
import type { IAttendanceService } from '../../../core/interfaces/services/hrm/attendance.service.interface';
import { AttendanceServiceKey } from '../../../core/interfaces/services/hrm/attendance.service.interface';
import type { IUserRepository } from '../../../core/interfaces/repositories/iam/user.repository.interface';
import { v4 as uuidv4 } from 'uuid';

import { SystemConfigService } from '../system/system-config.service';
import { Role } from '../../../core/domain/entities/iam/role.entity';
import { SalaryType } from '../../../core/domain/enums/salary-type.enum';

@Injectable()
export class PayrollService implements IPayrollService {
    constructor(
        @Inject('IPayrollRepository')
        private readonly repo: IPayrollRepository,
        @Inject(AttendanceServiceKey)
        private readonly attendanceService: IAttendanceService,
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        private readonly systemConfigService: SystemConfigService
    ) {}

    async calculateMonthlySalary(userId: string, month: number, year: number): Promise<Payroll> {
        const user = await this.userRepository.findOneById(userId);
        if (!user) {
             throw new NotFoundException('User not found.');
        }

        // 1. Determine Base Salary & Salary Type (Priority: User > Role > Default)
        let baseSalary = user.baseSalary;
        let salaryType = user.salaryType;

        if (!baseSalary || baseSalary === 0) {
            if (user.roles && user.roles.length > 0) {
                 // Find role with highest salary if multiple? For now just take first with salary
                 const roleWithSalary = user.roles.find((r: Role) => r.baseSalary > 0);
                 console.log(`[PayrollService] User: ${user.fullName}, Roles: ${user.roles.map(r => `${r.name}(${r.baseSalary})`).join(', ')}`);
                 if (roleWithSalary) {
                     baseSalary = Number(roleWithSalary.baseSalary);
                     salaryType = roleWithSalary.salaryType;
                     console.log(`[PayrollService] Using Role Salary: ${baseSalary} (${salaryType})`);
                 }
            } else {
                 console.log(`[PayrollService] User has no roles or roles have no salary.`);
            }
        }
        console.log(`[PayrollService] Final Base Salary: ${baseSalary}`);
        
        // 2. Fetch System Configuration
        const standardDaysConfig = await this.systemConfigService.getConfig('STANDARD_WORKING_DAYS', '26');
        const standardDays = parseFloat(standardDaysConfig);

        const workHoursConfig = await this.systemConfigService.getConfig('WORK_HOURS_PER_DAY', '8');
        const standardWorkHours = parseFloat(workHoursConfig);

        const otRateConfig = await this.systemConfigService.getConfig('OT_RATE', '1.5');
        const otRate = parseFloat(otRateConfig);

        // 3. Calculate Attendance Data
        const attendanceList = await this.attendanceService.getHistory(userId, month, year);
        
        let totalNormalHours = 0;
        let totalOtHours = 0;

        attendanceList.forEach(a => {
            if (!a.checkOut) {
               
                if (a.workingHours > 0) {
                     totalNormalHours += Number(a.workingHours);
                } else if (a.status === 'PRESENT') {
                    totalNormalHours += standardWorkHours;
                }
            } else {
                if (a.overtimeHours > 0) {
                    totalOtHours += Number(a.overtimeHours);
                    const normal = Number(a.workingHours) - Number(a.overtimeHours);
                    totalNormalHours += (normal > 0 ? normal : 0);
                } else {
                    // Logic for OT fallback if overtimeHours field was not set but workingHours > standard
                     if (Number(a.workingHours) > standardWorkHours) {
                         const ot = Number(a.workingHours) - standardWorkHours;
                         totalOtHours += ot;
                         totalNormalHours += standardWorkHours;
                     } else {
                         totalNormalHours += Number(a.workingHours);
                     }
                }
            }
        });

        // 4. Calculate Salary
        let hourlyRate = 0;
        const totalStandardHours = standardDays * standardWorkHours;

        if (baseSalary && baseSalary > 0) {
            if (salaryType === SalaryType.HOURLY) {
                hourlyRate = baseSalary; // Base Salary IS the hourly rate
            } else {
                // Monthly: Rate = MonthlySalary / StandardHours
                hourlyRate = baseSalary / totalStandardHours;
            }
        }

        const normalSalary = totalNormalHours * hourlyRate;
        const otSalary = totalOtHours * hourlyRate * otRate;
        
        const totalSalary = normalSalary + otSalary;
        
        // Total Working Days for display (convert back to days)
        const totalWorkingDays = parseFloat(((totalNormalHours + totalOtHours) / standardWorkHours).toFixed(2));


        // 5. Save/Update Payroll
        let payroll = await this.repo.findByUserAndMonth(userId, month, year);
        
        if (payroll) {
             if (payroll.status === PayrollStatus.PAID) {
                 throw new BadRequestException('Payroll for this month is already PAID and cannot be modified.');
             }

             const updatedPayroll = new Payroll(
                 payroll.id,
                 userId,
                 month,
                 year,
                 totalWorkingDays,
                 baseSalary || 0,
                 parseFloat(totalSalary.toFixed(2)),
                 parseFloat(totalNormalHours.toFixed(2)),
                 parseFloat(totalOtHours.toFixed(2)),
                 parseFloat(hourlyRate.toFixed(2)),
                 payroll.status, 
                 payroll.createdAt,
                 new Date()
             );
             return await this.repo.save(updatedPayroll);
        } else {
            const newPayroll = new Payroll(
                uuidv4(),
                userId,
                month,
                year,
                totalWorkingDays,
                baseSalary || 0,
                parseFloat(totalSalary.toFixed(2)),
                parseFloat(totalNormalHours.toFixed(2)),
                parseFloat(totalOtHours.toFixed(2)),
                parseFloat(hourlyRate.toFixed(2)),
                PayrollStatus.DRAFT
            );
            return await this.repo.save(newPayroll);
        }
    }

    async getPayroll(userId: string, month: number, year: number): Promise<Payroll | null> {
        return await this.repo.findByUserAndMonth(userId, month, year);
    }

    async getMonthlyPayrollList(month: number, year: number): Promise<Payroll[]> {
        // Lấy danh sách bảng lương theo tháng/năm
        const result = await this.repo.findByMonth(month, year);
        return result;
    }

    async updatePayroll(id: string, data: Partial<Payroll>): Promise<Payroll> {
        const payroll = await this.repo.findById(id);
        if (!payroll) {
            throw new NotFoundException('Payroll record not found.');
        }

        if (payroll.status === PayrollStatus.PAID) {
            throw new BadRequestException('Cannot update a PAID payroll record.');
        }

        // Update fields allowed for manual edit
        payroll.updateMetrics(
            data.totalWorkingDays,
            data.totalSalary,
            data.totalNormalHours,
            data.totalOtHours,
            data.hourlyRate
        );

        return await this.repo.save(payroll);
    }
}
