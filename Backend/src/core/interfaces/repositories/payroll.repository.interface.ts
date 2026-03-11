import { Payroll } from "../../domain/entities/hrm/payroll.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IPayrollRepository extends IBaseRepository<Payroll> {
    findByUserAndMonth(userId: string, month: number, year: number): Promise<Payroll | null>;
    findByMonth(month: number, year: number): Promise<Payroll[]>;
    findById(id: string): Promise<Payroll | null>;
}
