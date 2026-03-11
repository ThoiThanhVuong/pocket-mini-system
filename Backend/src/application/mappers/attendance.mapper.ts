import { Attendance, AttendanceStatus } from "../../core/domain/entities/hrm/attendance.entity";
import { AttendanceResponseDto } from "../dtos/hrm/attendance-response.dto";

export class AttendanceMapper {
    static toResponse(attendance: Attendance): AttendanceResponseDto {
        return {
            id: attendance.id,
            userId: attendance.userId,

            checkInTime: attendance.checkIn!, // Force unwrap or handle null
            checkOutTime: attendance.checkOut || undefined,
            workingHours: attendance.workingHours,
            status: attendance.status,
            date: attendance.date,
            notes: attendance.note, // Entity has 'note' getter, DTO has 'notes'
            isLate: attendance.status === AttendanceStatus.LATE,
            isEarlyLeave: false // Not implemented in Entity yet
        };
    }
}
