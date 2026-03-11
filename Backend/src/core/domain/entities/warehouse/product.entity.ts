import { DomainException } from '../../../exceptions/domain.exception';
import { BaseEntity } from '../base.entity';

export class Product extends BaseEntity {
    private _sku:string;
    private _name:string;
    private _description:string;
    private _image:string;
    private _categoryId: string | null;
    private _unit:string;
    private _price: number;
    private _isActive: boolean;
    private _minStockLevel: number; // Tồn kho an toàn
    private _stockQuantity: number; // Tổng tồn kho hiện tại (Virtual property)

    constructor(
        id: string, 
        sku: string, 
        name: string, 
        description: string, 
        image: string, 
        categoryId: string | null, 
        unit: string, 
        price: number, 
        isActive: boolean, 
        createdAt: Date = new Date(), 
        updatedAt: Date = new Date(),
        minStockLevel: number = 0,
        stockQuantity: number = 0
    ) {
        super(id, createdAt, updatedAt);
        this._sku = sku;
        this._name = name;
        this._description = description;
        this._image = image;
        this._categoryId = categoryId;
        this._unit = unit;
        this._price = price;
        this._isActive = isActive;
        this._minStockLevel = minStockLevel;
        this._stockQuantity = stockQuantity;
        this.validate();
    }

    private validate(): void {
        if (!this._name || this._name.length < 3) {
            throw new DomainException('Name must be at least 3 characters long.');
        }
        if (!this._sku) {
            throw new DomainException('SKU is required.');
        }
        if (this._price < 0) {
            throw new DomainException('Price cannot be negative.');
        }
        if (this._minStockLevel < 0) {
            throw new DomainException('Min stock level cannot be negative.');
        }
    }

    get sku(): string { return this._sku; }
    set sku(value: string) { this._sku = value; }

    get name(): string { return this._name; }
    set name(value: string) { this._name = value; }

    get description(): string { return this._description; }
    set description(value: string) { this._description = value; }

    get image(): string { return this._image; }
    set image(value: string) { this._image = value; }

    get categoryId(): string | null { return this._categoryId; }
    set categoryId(value: string | null) { this._categoryId = value; }

    get unit(): string { return this._unit; }
    set unit(value: string) { this._unit = value; }

    get price(): number { return this._price; }
    set price(value: number) { this._price = value; }

    get isActive(): boolean { return this._isActive; }
    set isActive(value: boolean) { this._isActive = value; }

    get minStockLevel(): number { return this._minStockLevel; }
    set minStockLevel(value: number) { 
        if(value < 0) throw new DomainException('Min stock level cannot be negative');
        this._minStockLevel = value; 
    }

    get stockQuantity(): number { return this._stockQuantity; }
    set stockQuantity(value: number) { this._stockQuantity = value; }

    public updatePrice(newPrice: number): void {
        if (newPrice < 0) {
            throw new DomainException('Price cannot be negative.');
        }
        this._price = newPrice;
    }
}
