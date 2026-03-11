import { BaseEntity } from '../base.entity';
import { StockOutItem } from './stock-out-item.entity';
import { TransactionStatus } from '../../enums/transaction-status.enum';
import { DomainException } from '../../../exceptions/domain.exception';

export class StockOut extends BaseEntity {
    private _customerId: string;
    private _warehouseId: string;
    private _userId: string;
    private _referenceCode: string;
    private _status: TransactionStatus;
    private _items: StockOutItem[];

    constructor(
        id: string, 
        customerId: string, 
        warehouseId: string, 
        userId: string, 
        referenceCode: string, 
        items: StockOutItem[] = [],
        status: TransactionStatus = TransactionStatus.PENDING,
        createdAt: Date = new Date(), 
        updatedAt: Date = new Date()
    ) {
        super(id, createdAt, updatedAt);
        this._customerId = customerId;
        this._warehouseId = warehouseId;
        this._userId = userId;
        this._referenceCode = referenceCode;
        this._items = items;
        this._status = status;
        this.validate();
    }

    get customerId(): string { return this._customerId; }
    set customerId(value: string) { this._customerId = value; }

    get warehouseId(): string { return this._warehouseId; }
    set warehouseId(value: string) { this._warehouseId = value; }

    get userId(): string { return this._userId; }
    set userId(value: string) { this._userId = value; }

    get referenceCode(): string { return this._referenceCode; }
    set referenceCode(value: string) { this._referenceCode = value; }

    get items(): StockOutItem[] { return this._items; }

    get status(): TransactionStatus { return this._status; }
    set status(value: TransactionStatus) { this._status = value; }

    public calculateTotalAmount(): number {
        return this._items.reduce((total, item) => total + (item.quantity * item.price), 0);
    }

    public addItem(item: StockOutItem): void {
        if (this.isCompleted()) throw new DomainException('Phiếu đã hoàn thành, không được thêm hàng');
        this._items.push(item);
    }

    public async complete(): Promise<void> {
        if (this._status !== TransactionStatus.PENDING) {
            throw new DomainException('Only pending transactions can be completed.');
        }
        if (!this._items || this._items.length === 0) {
            throw new DomainException('Cannot complete a stock-out without items.');
        }
        this._status = TransactionStatus.COMPLETED;
        this._updatedAt = new Date();
    }

    public isCompleted(): boolean {
        return this._status === TransactionStatus.COMPLETED;
    }

    private validate(): void {
        if (!this._customerId || this._customerId.length < 3) {
            throw new DomainException('Customer ID is required.');
        }
        if (!this._warehouseId) {
            throw new DomainException('Warehouse ID is required.');
        }
        if (!this._referenceCode) {
            throw new DomainException('Reference code is required.');
        }
    }
}
