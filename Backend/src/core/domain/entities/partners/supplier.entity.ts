import { BaseEntity } from '../base.entity';
import { PartnerStatus } from '../../enums/partners-status.enum';
import { Email } from '../../value-objects/email.value-object';

export class Supplier extends BaseEntity {
    private _name: string;
    private _contactPerson: string;
    private _phone: string;
    private _email: Email | null;
    private _address: string | undefined;
    private _status: PartnerStatus;

    constructor(
        id: string, 
        name: string, 
        contactPerson: string, 
        phone: string, 
        email: string | null, 
        address?: string, 
        status: PartnerStatus = PartnerStatus.ACTIVE, 
        createdAt: Date = new Date(), 
    ) {
        super(id, createdAt);
        this._name = name;
        this._contactPerson = contactPerson;
        this._phone = phone;
        this._email = email ? new Email(email) : null;
        this._address = address;
        this._status = status;
    }

    get name(): string { return this._name; }
    get contactPerson(): string { return this._contactPerson; }
    get phone(): string { return this._phone; }
    get email(): string { return this._email ? this._email.getValue() : ''; }
    get address(): string { return this._address || ''; }
    get status(): PartnerStatus { return this._status; }

    public updateDetails(name?: string, contactPerson?: string, phone?: string, email?: string | null, address?: string, status?: PartnerStatus): void {
        if (name) this._name = name;
        if (contactPerson) this._contactPerson = contactPerson;
        if (phone) this._phone = phone;
        if (email !== undefined) this._email = email ? new Email(email) : null;
        if (address) this._address = address;
        if (status) this._status = status;
        this._updatedAt = new Date();
    }
    // Domain methods
    public markAsInactive(): void {
        this._status = PartnerStatus.INACTIVE;
    }

    public block(): void {
        this._status = PartnerStatus.BLOCKED;
    }

    public activate(): void {
        this._status = PartnerStatus.ACTIVE;
    }
}
