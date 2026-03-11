import { BaseEntity } from '../base.entity';
import { StockTransferItem } from './stock-transfer-item.entity';
import { TransactionStatus } from '../../enums/transaction-status.enum';
import { DomainException } from '../../../exceptions/domain.exception';

export class StockTransfer extends BaseEntity {
    private _fromWarehouseId: string;
    private _toWarehouseId: string;
    private _userId: string;
    private _referenceCode: string;
    private _items: StockTransferItem[];
    private _status: TransactionStatus;

    constructor(
        id: string,
        fromWarehouseId: string,
        toWarehouseId: string,
        userId: string,
        referenceCode: string,
        items: StockTransferItem[] = [],
        status: TransactionStatus = TransactionStatus.PENDING,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(id, createdAt, updatedAt);
        this._fromWarehouseId = fromWarehouseId;
        this._toWarehouseId = toWarehouseId;
        this._userId = userId;
        this._referenceCode = referenceCode;
        this._items = items;
        this._status = status;
        this.validate();
    }

    get fromWarehouseId(): string { return this._fromWarehouseId; }
    set fromWarehouseId(value: string) { this._fromWarehouseId = value; }

    get toWarehouseId(): string { return this._toWarehouseId; }
    set toWarehouseId(value: string) { this._toWarehouseId = value; }

    get userId(): string { return this._userId; }
    set userId(value: string) { this._userId = value; }

    get referenceCode(): string { return this._referenceCode; }
    set referenceCode(value: string) { this._referenceCode = value; }

    get items(): StockTransferItem[] { return this._items; }

    get status(): TransactionStatus { return this._status; }
    set status(value: TransactionStatus) { this._status = value; }

    public addItem(item: StockTransferItem): void {
        if (this.isCompleted()) throw new DomainException('Phiếu đã hoàn thành, không được thêm hàng');
        this._items.push(item);
    }

    public complete(): void {
        this._status = TransactionStatus.COMPLETED;
        this._updatedAt = new Date();
    }

    public isCompleted(): boolean {
        return this._status === TransactionStatus.COMPLETED;
    }

    private validate(): void {
        if (!this._fromWarehouseId) throw new DomainException('Origin warehouse is required.');
        if (!this._toWarehouseId) throw new DomainException('Destination warehouse is required.');
        if (this._fromWarehouseId === this._toWarehouseId) {
            throw new DomainException('From and To warehouse cannot be the same.');
        }
    }
}
