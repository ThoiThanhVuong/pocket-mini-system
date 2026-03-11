import { BaseEntity } from '../base.entity';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { TransactionReferenceType } from '../../enums/transaction-reference-type.enum';
import { DomainException } from '../../../exceptions/domain.exception';

export class Transaction extends BaseEntity {
    private _referenceId: string;
    private _referenceType: TransactionReferenceType;
    private _amount: number;
    private _method: PaymentMethod;
    
    private _paymentDescription: string;
    private _paidAt: Date | null;
    private _status: PaymentStatus;

    constructor(
        id: string, 
        referenceId: string, 
        referenceType: TransactionReferenceType, 
        amount: number, 
        method: PaymentMethod, 
        paymentDescription: string, 
        status: PaymentStatus = PaymentStatus.PENDING, 
        paidAt: Date | null = null, 
        createdAt: Date = new Date()
    ) {
        super(id, createdAt);
        this._referenceId = referenceId;
        this._referenceType = referenceType;
        this._amount = amount;
        this._method = method;
        this._paymentDescription = paymentDescription;
        this._paidAt = paidAt;
        this._status = status;
        this.validate();
    }

    get referenceId(): string { return this._referenceId; }
    set referenceId(value: string) { this._referenceId = value; }

    get referenceType(): TransactionReferenceType { return this._referenceType; }
    set referenceType(value: TransactionReferenceType) { this._referenceType = value; }

    get amount(): number { return this._amount; }
    set amount(value: number) { this._amount = value; }

    get method(): PaymentMethod { return this._method; }
    set method(value: PaymentMethod) { this._method = value; }

    get paymentDescription(): string { return this._paymentDescription; }
    set paymentDescription(value: string) { this._paymentDescription = value; }

    get paidAt(): Date | null { return this._paidAt; }
    set paidAt(value: Date | null) { this._paidAt = value; }

    get status(): PaymentStatus { return this._status; }
    set status(value: PaymentStatus) { this._status = value; }

    private validate(): void {
        if (!this._referenceId) throw new DomainException('Reference ID is required.');
        if (!this._referenceType) throw new DomainException('Reference type is required.');
        if (this._amount < 0) throw new DomainException('Amount must be positive.');
        if (!this._method) throw new DomainException('Payment method is required.');
    }
    
    public markAsPaid(paidDate: Date = new Date()): void {
        if (this._status === PaymentStatus.PAID) throw new DomainException('Giao dịch đã được thanh toán trước đó');
        this._status = PaymentStatus.PAID;
        this._paidAt = paidDate;
    }
    
    public markAsFailed(): void {
        if (this._status === PaymentStatus.PAID) throw new DomainException('Không thể hủy giao dịch đã thành công');
        this._status = PaymentStatus.FAILED;
    }   
}
