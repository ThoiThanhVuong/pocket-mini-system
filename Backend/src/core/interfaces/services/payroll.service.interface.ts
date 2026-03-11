import { Payroll } from "../../domain/entities/hrm/payroll.entity";

export interface IPayrollService {
    calculateMonthlySalary(userId: string, month: number, year: number): Promise<Payroll>;
    getPayroll(userId: string, month: number, year: number): Promise<Payroll | null>;
    getMonthlyPayrollList(month: number, year: number): Promise<Payroll[]>;
    updatePayroll(id: string, data: Partial<Payroll>): Promise<Payroll>;
}

export const PayrollServiceKey = 'IPayrollService';
