import { Attendance } from "../../domain/entities/hrm/attendance.entity";

export interface IAttendanceService {
    checkIn(userId: string): Promise<Attendance>;
    checkOut(userId: string): Promise<Attendance>;
    getHistory(userId: string, month: number, year: number): Promise<Attendance[]>;
    getTodayAttendance(userId: string): Promise<Attendance | null>;
    update(id: string, data: Partial<Attendance>): Promise<Attendance>;
    registerLeave(userId: string, date: Date, reason: string): Promise<Attendance>;
}

export const AttendanceServiceKey = 'IAttendanceService';
