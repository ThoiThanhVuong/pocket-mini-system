import { Payroll } from "../../core/domain/entities/hrm/payroll.entity";
import { PayrollResponseDto } from "../dtos/hrm/payroll-response.dto";
import { UserMapper } from "./user.mapper";

export class PayrollMapper {
    static toResponse(payroll: Payroll): PayrollResponseDto {
        return {
            id: payroll.id,
            userId: payroll.userId,
            month: payroll.month,
            year: payroll.year,
            totalWorkingDays: payroll.totalWorkingDays,
            baseSalary: payroll.baseSalary,
            totalSalary: payroll.totalSalary,
            totalNormalHours: payroll.totalNormalHours,
            totalOtHours: payroll.totalOtHours,
            hourlyRate: payroll.hourlyRate,
            status: payroll.status,
            createdAt: payroll.createdAt,
            updatedAt: payroll.updatedAt,
            user: payroll.user ? UserMapper.toResponse(payroll.user) : undefined
        };
    }
}
