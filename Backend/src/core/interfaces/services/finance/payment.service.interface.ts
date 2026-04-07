import { PaymentDto, CreatePaymentDto } from '../../../../application/dtos/finance/payment.dto';

export const IPaymentServiceKey = 'IPaymentService';

export interface IPaymentService {
    createPayment(data: CreatePaymentDto): Promise<PaymentDto>;
    getPaymentById(id: string): Promise<PaymentDto | null>;
    getPaymentsByReference(referenceId: string): Promise<PaymentDto[]>;
    getAllPayments(): Promise<PaymentDto[]>;
    markAsPaid(id: string, method: string): Promise<PaymentDto>;
    markAsFailed(id: string): Promise<PaymentDto>;
    markAsCancelledByReference(referenceId: string): Promise<void>;
}
