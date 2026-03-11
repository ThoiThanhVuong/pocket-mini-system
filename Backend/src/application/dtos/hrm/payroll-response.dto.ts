import { PayrollStatus } from "../../../core/domain/entities/hrm/payroll.entity";
import { UserResponseDto } from "../iam/user-response.dto";

export class PayrollResponseDto {
    id: string;
    userId: string;
    month: number;
    year: number;
    totalWorkingDays: number;
    baseSalary: number;
    totalSalary: number;
    totalNormalHours: number;
    totalOtHours: number;
    hourlyRate: number;
    status: PayrollStatus;
    createdAt: Date;
    updatedAt: Date;
    user?: UserResponseDto; // Optional user details
}
