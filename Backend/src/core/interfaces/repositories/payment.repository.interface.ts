import { Payment } from '../../../infrastructure/database/entities/finance/payment.entity';

export interface IPaymentRepository {
    create(data: Partial<Payment>): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findByReference(referenceId: string): Promise<Payment[]>;
    findAll(): Promise<Payment[]>;
    update(id: string, data: Partial<Payment>): Promise<Payment>;
    delete(id: string): Promise<void>;
}
