import { DomainException } from '../../../exceptions/domain.exception';
import { BaseEntity } from '../base.entity';

export class StockOutItem extends BaseEntity {
    private _stockOutId: string;
    private _productId: string;
    private _quantity: number;
    private _price: number;

    constructor(
        id: string,
        stockOutId: string,
        productId: string,
        quantity: number,
        price: number,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(id, createdAt, updatedAt);
        this._stockOutId = stockOutId;
        this._productId = productId;
        this._quantity = quantity;
        this._price = price;
        this.validate();
    }

    get stockOutId(): string { return this._stockOutId; }
    set stockOutId(value: string) { this._stockOutId = value; }

    get productId(): string { return this._productId; }
    set productId(value: string) { this._productId = value; }

    get quantity(): number { return this._quantity; }
    set quantity(value: number) { this._quantity = value; }

    get price(): number { return this._price; }
    set price(value: number) { this._price = value; }

    private validate(): void {
        if (!this._stockOutId) throw new DomainException('StockOut ID is required.');
        if (!this._productId) throw new DomainException('Product ID is required.');
        if (this._quantity <= 0) throw new DomainException('Quantity must be greater than 0.');
        if (this._price < 0) throw new DomainException('Price cannot be negative.');
    }
}
