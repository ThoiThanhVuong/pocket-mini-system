import { DomainException } from '../../../exceptions/domain.exception';
import { BaseEntity } from '../base.entity';

export class StockTransferItem extends BaseEntity {
    private _stockTransferId: string;
    private _productId: string;
    private _quantity: number;

    constructor(
        id: string,
        stockTransferId: string,
        productId: string,
        quantity: number,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(id, createdAt, updatedAt);
        this._stockTransferId = stockTransferId;
        this._productId = productId;
        this._quantity = quantity;
        this.validate();
    }

    get stockTransferId(): string { return this._stockTransferId; }
    set stockTransferId(value: string) { this._stockTransferId = value; }

    get productId(): string { return this._productId; }
    set productId(value: string) { this._productId = value; }

    get quantity(): number { return this._quantity; }
    set quantity(value: number) { this._quantity = value; }

    private validate(): void {
        if (!this._stockTransferId) throw new DomainException('Stock transfer ID is required.');
        if (!this._productId) throw new DomainException('Product ID is required.');
        if (this._quantity <= 0) throw new DomainException('Quantity must be greater than 0.');
    }
}
