import { DomainException } from '../../../exceptions/domain.exception';
import { BaseEntity } from '../base.entity';

export class Inventory extends BaseEntity {
    private _warehouseId:string;
    private _productId:string;
    private _quantity:number;

    constructor(id: string, warehouseId: string, productId: string, quantity: number) {
        super(id);
        this._warehouseId = warehouseId;
        this._productId = productId;
        this._quantity = quantity;
        this.validate();
    }

    get warehouseId(): string { return this._warehouseId; }
    set warehouseId(value: string) { this._warehouseId = value; }

    get productId(): string { return this._productId; }
    set productId(value: string) { this._productId = value; }

    get quantity(): number { return this._quantity; }
    set quantity(value: number) { this._quantity = value; }

    private validate(): void {
        if (!this._warehouseId || this._warehouseId.length < 3) {
            throw new DomainException('Warehouse ID must be at least 3 characters long.');
        }
        if (!this._productId || this._productId.length < 3) {
            throw new DomainException('Product ID must be at least 3 characters long.');
        }
        if (this._quantity < 0) {
            throw new DomainException('Quantity must be a positive number.');
        }
    }

    public increaseStock(amount:number):void{
        if(amount<=0) throw new DomainException('Số lượng nhập phải lớn hơn 0');
        this._quantity+=amount;
    }

    public decreaseStock(amount:number):void{
        if(amount<=0) throw new DomainException('Số lượng xuất phải lớn hơn 0');
        if(this._quantity < amount) throw new DomainException('Không đủ hàng trong kho')
        this._quantity-=amount;
    }
}
