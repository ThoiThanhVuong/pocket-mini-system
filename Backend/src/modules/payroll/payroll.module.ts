import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from '../../presentation/controllers/payroll.controller';
import { PayrollService } from '../../application/use-cases/payroll.service';
import { PayrollRepository } from '../../infrastructure/database/repositories/payroll.repository';
import { Payroll } from '../../infrastructure/database/entities/hrm/payroll.entity';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { SystemModule } from '../system/system.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll]),
    AuthModule,
    AttendanceModule,
    SystemModule,

  ],
  controllers: [PayrollController],
  providers: [
    {
      provide: 'IPayrollRepository',
      useClass: PayrollRepository
    },
    {
      provide: 'IPayrollService',
      useClass: PayrollService
    }
  ],
  exports: ['IPayrollService']
})
export class PayrollModule {}
