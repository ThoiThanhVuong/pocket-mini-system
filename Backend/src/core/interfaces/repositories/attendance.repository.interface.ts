import { Attendance } from "../../domain/entities/hrm/attendance.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IAttendanceRepository extends IBaseRepository<Attendance> {
    findByUserAndDate(userId: string, date: Date): Promise<Attendance | null>;
    findByUserAndMonth(userId: string, month: number, year: number): Promise<Attendance[]>;
}
