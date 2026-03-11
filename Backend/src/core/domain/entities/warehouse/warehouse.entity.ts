import { DomainException } from '../../../exceptions/domain.exception';
import { BaseEntity } from '../base.entity';

export class Warehouse extends BaseEntity {
    private _name:string;
    private _location:string;
    private _city?: string;
    private _country?: string;
    private _capacity?: number;
    private _manager?: string;
    private _contactInfo?: string;
    private _status?: string;

    constructor(
        id: string,
        name: string,
        location: string,
        city?: string,
        country?: string,
        capacity?: number,
        manager?: string,
        contactInfo?: string,
        status: string = 'ACTIVE',
        createdAt: Date = new Date()
    ){
        super(id,createdAt);
        this._name=name;
        this._location=location;
        this._city=city;
        this._country=country;
        this._capacity=capacity;
        this._manager=manager;
        this._contactInfo=contactInfo;
        this._status=status;
        this.validate();
    }

    get name():string{
        return this._name;
    }
    set name(value:string){
        this._name=value;
    }
    get location():string{
        return this._location;
    }
    set location(value:string){
        this._location=value;
    }
    get city():string | undefined { return this._city; }
    set city(value:string | undefined) { this._city=value; }

    get country():string | undefined { return this._country; }
    set country(value:string | undefined) { this._country=value; }

    get capacity():number | undefined { return this._capacity; }
    set capacity(value:number | undefined) { this._capacity=value; }

    get manager():string | undefined { return this._manager; }
    set manager(value:string | undefined) { this._manager=value; }

    get contactInfo():string | undefined { return this._contactInfo; }
    set contactInfo(value:string | undefined) { this._contactInfo=value; }

    get status():string | undefined { return this._status; }
    set status(value:string | undefined) { this._status=value; }
    private validate(): void {
        if (!this._name || this._name.length < 3) {
            throw new DomainException('Name must be at least 3 characters long.');
        }
        if (!this._location || this._location.length < 3) {
            throw new DomainException('Location must be at least 3 characters long.');
        }
        if (this._capacity !== undefined && this._capacity !== null && this._capacity < 0) {
            throw new DomainException('Capacity cannot be negative.');
        }
    }
}
