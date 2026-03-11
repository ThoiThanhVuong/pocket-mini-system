export class PaymentDto {
    id: string;
    referenceType: string;
    referenceId: string;
    amount: number;
    method?: string;
    paymentDescription?: string;
    status: string;
    paidAt?: Date;
    createdAt: Date;
}

export class CreatePaymentDto {
    referenceType: string;
    referenceId: string;
    amount: number;
    paymentDescription?: string;
    method?: string;
}
