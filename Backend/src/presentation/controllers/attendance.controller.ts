import { Controller, Post, Get, Put, UseGuards, Request, Inject, Query, Body, Param, ParseIntPipe, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../core/domain/enums/permission-code.enum';
import { AttendanceServiceKey } from '../../core/interfaces/services/attendance.service.interface';
import type { IAttendanceService } from '../../core/interfaces/services/attendance.service.interface';
import { AttendanceMapper } from '../../application/mappers/attendance.mapper';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AttendanceController {
    constructor(
        @Inject(AttendanceServiceKey)
        private readonly service: IAttendanceService
    ) {}

    // Tự điểm danh vào (Check-in)
    @Post('check-in')
    // @RequirePermissions(PermissionCode.USER_VIEW) 
    async checkIn(@Req() req: any) {
        const attendance = await this.service.checkIn(req.user.id);
        return AttendanceMapper.toResponse(attendance);
    }

    // Tự điểm danh ra (Check-out)
    @Post('check-out')
    async checkOut(@Request() req) {
        const attendance = await this.service.checkOut(req.user.id);
        return AttendanceMapper.toResponse(attendance);
    }

    // Lấy lịch sử điểm danh của bản thân
    @Get('me')
    async getMyHistory(@Request() req, @Query('month') month?: string, @Query('year') year?: string) {
        // Nếu không truyền tháng/năm, mặc định lấy thời gian hiện tại
        const m = month ? parseInt(month) : new Date().getMonth() + 1;
        const y = year ? parseInt(year) : new Date().getFullYear();
        const history = await this.service.getHistory(req.user.id, m, y);
        return history.map(a => AttendanceMapper.toResponse(a));
    }

    // Lấy thông tin điểm danh hôm nay
    @Get('me/today')
    async getMyToday(@Request() req) {
        const attendance = await this.service.getTodayAttendance(req.user.id);
        return attendance ? AttendanceMapper.toResponse(attendance) : null;
    }

    // Admin: Xem lịch sử của nhân viên
    @Get('users/:userId')
    // @RequirePermissions(PermissionCode.ATTENDANCE_MANAGE)
    async getUserHistory(@Param('userId') userId: string, @Query('month', ParseIntPipe) month: number, @Query('year', ParseIntPipe) year: number) {
        const m = month || new Date().getMonth() + 1;
        const y = year || new Date().getFullYear();
        const history = await this.service.getHistory(userId, m, y);
        return history.map(a => AttendanceMapper.toResponse(a));
    }

    // Admin: Cập nhật thủ công
    @Put(':id')
    // @RequirePermissions(PermissionCode.ATTENDANCE_MANAGE)
    async updateAttendance(@Param('id') id: string, @Body() body: any) {
        const attendance = await this.service.update(id, body);
        return AttendanceMapper.toResponse(attendance);
    }

    // Đăng ký nghỉ phép
    @Post('leave')
    async registerLeave(@Req() req: any, @Body() body: { date: string; reason: string }) {
        const userId = req.user.id;
        const date = new Date(body.date);
        if (isNaN(date.getTime())) {
             throw new Error("Ngày không hợp lệ");
        }
        const attendance = await this.service.registerLeave(userId, date, body.reason);
        return AttendanceMapper.toResponse(attendance);
    }
}
