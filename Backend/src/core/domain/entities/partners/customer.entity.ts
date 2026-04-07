import { BaseEntity } from '../base.entity';
import { PartnerStatus } from '../../enums/partners-status.enum';
import { Email } from '../../value-objects/email.value-object';

export class Customer extends BaseEntity {
    private _name:string;
    private _phone:string;
    private _email:Email | null;
    private _address:string | undefined;
    private _status:PartnerStatus;
    private _customerType: string;
    private _companyName: string | undefined;
    private _loyaltyTier: string;
    private _totalOrders?: number;
    private _totalSpent?: number;

    constructor(
        id:string,
        name:string,
        phone:string,
        email:string | null,
        address?:string,
        status:PartnerStatus = PartnerStatus.ACTIVE,
        customerType: string = 'Individual',
        companyName: string | undefined = undefined,
        loyaltyTier: string = 'Bronze',
        createdAt:Date=new Date()
    ){
        super(id,createdAt);
        this._name=name;
        this._phone=phone;
        this._email=email ? new Email(email) : null;
        this._address=address;
        this._status=status;
        this._customerType = customerType;
        this._companyName = companyName;
        this._loyaltyTier = loyaltyTier;
    }
    get name():string {return this._name;}
    get phone():string {return this._phone;}
    get email():string {return this._email ? this._email.getValue() : '';}
    get address():string {return this._address || '';}
    get status():PartnerStatus {return this._status;}
    get customerType(): string { return this._customerType; }
    get companyName(): string | undefined { return this._companyName; }
    get loyaltyTier(): string { return this._loyaltyTier; }
    get totalOrders(): number { return this._totalOrders || 0; }
    get totalSpent(): number { return this._totalSpent || 0; }

    set totalOrders(value: number) { this._totalOrders = value; }
    set totalSpent(value: number) { this._totalSpent = value; }

    public markAsInactive(): void {
        this._status = PartnerStatus.INACTIVE;
    }

    public block(): void {
        this._status = PartnerStatus.BLOCKED;
    }

    public activate(): void {
        this._status = PartnerStatus.ACTIVE;
    }

    public updateDetails(name?: string, phone?: string, email?: string | null, address?: string, customerType?: string, companyName?: string, loyaltyTier?: string): void {
        if (name) this._name = name;
        if (phone) this._phone = phone;
        if (email !== undefined) this._email = email ? new Email(email) : null;
        if (address) this._address = address;
        if (customerType) this._customerType = customerType;
        if (companyName !== undefined) this._companyName = companyName;
        if (loyaltyTier) this._loyaltyTier = loyaltyTier;
    }
}
