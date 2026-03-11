import { AttendanceStatus } from "../../../core/domain/entities/hrm/attendance.entity";

export class AttendanceResponseDto {
    id: string;
    userId: string;
    checkInTime: Date;
    checkOutTime?: Date;
    workingHours?: number;
    status: AttendanceStatus;
    date: Date;
    notes?: string;
    isLate: boolean;
    isEarlyLeave?: boolean;
}
