import { Injectable, Inject } from '@nestjs/common';
import { IPaymentService } from '../../../core/interfaces/services/finance/payment.service.interface';
import type { IPaymentRepository } from '../../../core/interfaces/repositories/finance/payment.repository.interface';
import { CreatePaymentDto, PaymentDto } from '../../dtos/finance/payment.dto';
import { Payment } from '../../../infrastructure/database/entities/finance/payment.entity';

export const IPaymentRepositoryKey = 'IPaymentRepository';

@Injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @Inject(IPaymentRepositoryKey)
        private readonly paymentRepo: IPaymentRepository,
    ) {}

    private toDto(entity: Payment): PaymentDto {
        return {
            id: entity.id,
            referenceType: entity.referenceType,
            referenceId: entity.referenceId,
            amount: entity.amount,
            method: entity.method,
            paymentDescription: entity.paymentDescription,
            status: entity.status,
            paidAt: entity.paidAt,
            createdAt: entity.createdAt,
        };
    }

    async createPayment(data: CreatePaymentDto): Promise<PaymentDto> {
        const payment = await this.paymentRepo.create({
            ...data,
            status: 'pending'
        });
        return this.toDto(payment);
    }

    async getPaymentById(id: string): Promise<PaymentDto | null> {
        const payment = await this.paymentRepo.findById(id);
        return payment ? this.toDto(payment) : null;
    }

    async getPaymentsByReference(referenceId: string): Promise<PaymentDto[]> {
        const payments = await this.paymentRepo.findByReference(referenceId);
        return payments.map(p => this.toDto(p));
    }

    async getAllPayments(): Promise<PaymentDto[]> {
        const payments = await this.paymentRepo.findAll();
        return payments.map(p => this.toDto(p));
    }

    async markAsPaid(id: string, method: string): Promise<PaymentDto> {
        const payment = await this.paymentRepo.update(id, {
            status: 'paid',
            method: method,
            paidAt: new Date()
        });
        return this.toDto(payment);
    }

    async markAsFailed(id: string): Promise<PaymentDto> {
        const payment = await this.paymentRepo.update(id, {
            status: 'failed'
        });
        return this.toDto(payment);
    }

    async markAsCancelledByReference(referenceId: string): Promise<void> {
        const payments = await this.paymentRepo.findByReference(referenceId);
        for (const p of payments) {
            if (p.status === 'pending') {
                await this.paymentRepo.update(p.id, { status: 'failed', paymentDescription: 'Hủy theo phiếu kho' });
            } else if (p.status === 'paid') {
                await this.paymentRepo.update(p.id, { status: 'refunded', paymentDescription: 'Hoàn tiền do hủy phiếu kho' });
            }
        }
    }
}
