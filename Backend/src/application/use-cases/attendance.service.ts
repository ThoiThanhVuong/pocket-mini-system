import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IAttendanceService } from '../../core/interfaces/services/attendance.service.interface';
import type { IAttendanceRepository } from '../../core/interfaces/repositories/attendance.repository.interface';
import { Attendance, AttendanceStatus } from '../../core/domain/entities/hrm/attendance.entity';
import { v4 as uuidv4 } from 'uuid';
import { SystemConfigService } from '../../modules/system/services/system-config.service';

@Injectable()
export class AttendanceService implements IAttendanceService {
    constructor(
        @Inject('IAttendanceRepository')
        private readonly repo: IAttendanceRepository,
        private readonly systemConfigService: SystemConfigService
    ) {}

    async checkIn(userId: string): Promise<Attendance> {
        const checkInTime = new Date();
        
        // Kiểm tra xem hôm nay đã check-in chưa
        // Repository sẽ tự xử lý việc so sánh ngày (bỏ qua giờ phút giây)
        const existing = await this.repo.findByUserAndDate(userId, checkInTime);
        
        if (existing) {
             throw new BadRequestException(`Bạn đã check-in ngày hôm nay rồi. (ID: ${existing.id})`);
        }

        const attendance = new Attendance(
            uuidv4(),
            userId,
            checkInTime, 
            null, // Check-in ban đầu là null, sẽ được set trong checkInNow
            null, // CheckOut Time
            0, // Giờ làm việc
            0, // Giờ tăng ca
            AttendanceStatus.PRESENT, 
            ''
        );
        
        // Lấy giờ bắt đầu làm việc từ cấu hình (Mặc định 7h sáng)
        const startHourConfig = await this.systemConfigService.getConfig('WORK_START_HOUR', '7');
        const startHour = parseInt(startHourConfig, 10);

        // Thực hiện logic check-in (tính toán đi muộn nếu có)
        attendance.checkInNow(checkInTime, startHour); 

        return await this.repo.save(attendance);
    }

    async checkOut(userId: string): Promise<Attendance> {
        const now = new Date();
        const attendance = await this.repo.findByUserAndDate(userId, now);
        
        if (!attendance) {
            throw new BadRequestException('Không tìm thấy bản ghi check-in check-in của ngày hôm nay.');
        }
        if (attendance.checkOut) {
            throw new BadRequestException('Bạn đã check-out ngày hôm nay rồi.');
        }

        attendance.checkOutNow(new Date());

        // Tính toán Tăng ca (Overtime)
        const workHoursConfig = await this.systemConfigService.getConfig('WORK_HOURS_PER_DAY', '8');
        const standardHours = parseFloat(workHoursConfig);
        
        // Logic: 
        // workingHours: Tổng thời gian làm việc thực tế (bao gồm cả tăng ca)
        // overtimeHours: Thời gian làm vượt mức tiêu chuẩn
        
        if (attendance.workingHours > standardHours) {
             // Ví dụ: Làm 10 tiếng, chuẩn 8 tiếng => Tăng ca 2 tiếng.
             // attendance.workingHours vẫn giữ là 10.
             attendance.overtimeHours = parseFloat((attendance.workingHours - standardHours).toFixed(2));
        } else {
             attendance.overtimeHours = 0;
        }

        return await this.repo.save(attendance);
    }

    async getHistory(userId: string, month: number, year: number): Promise<Attendance[]> {
        return await this.repo.findByUserAndMonth(userId, month, year);
    }

    async getTodayAttendance(userId: string): Promise<Attendance | null> {
        return await this.repo.findByUserAndDate(userId, new Date());
    }

    async update(id: string, data: Partial<Attendance>): Promise<Attendance> {
        const attendance = await this.repo.findOneById(id);
        if (!attendance) {
            throw new NotFoundException('Không tìm thấy bản ghi chấm công');
        }

        attendance.updateManual(
            data.checkIn ? new Date(data.checkIn) : undefined, 
            data.checkOut ? new Date(data.checkOut) : undefined, 
            data.overtimeHours, 
            data.note
        );

        return await this.repo.save(attendance);
    }

    async registerLeave(userId: string, date: Date, reason: string): Promise<Attendance> {
        const existing = await this.repo.findByUserAndDate(userId, date);
        
        if (existing) {
            // Nếu đã có bản ghi (ví dụ lỡ checkin), cập nhật thành nghỉ phép
            existing.markAsLeave(reason);
            return await this.repo.save(existing);
        } else {
             // Tạo mới bản ghi nghỉ phép
             const attendance = new Attendance(
                uuidv4(),
                userId,
                date, 
                null, 
                null, 
                0, 
                0, 
                AttendanceStatus.LEAVE, 
                reason
            );
            return await this.repo.save(attendance);
        }
    }
}
