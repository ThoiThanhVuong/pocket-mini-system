import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../infrastructure/database/entities/finance/payment.entity';

import { PaymentRepository } from '../../infrastructure/database/repositories/payment.repository';
import { IPaymentRepositoryKey } from '../../application/use-cases/payment.service';
import { PaymentService } from '../../application/use-cases/payment.service';
import { IPaymentServiceKey } from '../../core/interfaces/services/payment.service.interface';
import { PaymentController } from '../../presentation/controllers/payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentController],
  providers: [
    { provide: IPaymentRepositoryKey, useClass: PaymentRepository },
    { provide: IPaymentServiceKey, useClass: PaymentService },
  ],
  exports: [IPaymentServiceKey],
})
export class FinanceModule {}
