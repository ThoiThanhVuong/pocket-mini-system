import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from '../../presentation/controllers/hrm/attendance.controller';
import { AttendanceService } from '../../application/use-cases/hrm/attendance.service';
import { AttendanceRepository } from '../../infrastructure/database/repositories/hrm/attendance.repository';
import { Attendance } from '../../infrastructure/database/entities/hrm/attendance.entity';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    AuthModule,
    SystemModule
  ],
  controllers: [AttendanceController],
  providers: [
    {
      provide: 'IAttendanceRepository',
      useClass: AttendanceRepository
    },
    {
      provide: 'IAttendanceService',
      useClass: AttendanceService
    }
  ],
  exports: ['IAttendanceService']
})
export class AttendanceModule {}
