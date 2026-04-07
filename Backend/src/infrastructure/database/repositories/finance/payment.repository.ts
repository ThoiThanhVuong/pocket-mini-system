import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/finance/payment.entity';
import { IPaymentRepository } from '../../../../core/interfaces/repositories/finance/payment.repository.interface';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
    constructor(
        @InjectRepository(Payment)
        private readonly repo: Repository<Payment>,
    ) {}

    async create(data: Partial<Payment>): Promise<Payment> {
        const payment = this.repo.create(data);
        return await this.repo.save(payment);
    }

    async findById(id: string): Promise<Payment | null> {
        return await this.repo.findOne({ where: { id } });
    }

    async findByReference(referenceId: string): Promise<Payment[]> {
        return await this.repo.find({ where: { referenceId } });
    }

    async findAll(): Promise<Payment[]> {
        return await this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async update(id: string, data: Partial<Payment>): Promise<Payment> {
        await this.repo.update(id, data);
        const updated = await this.findById(id);
        if (!updated) throw new Error('Payment not found');
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}
