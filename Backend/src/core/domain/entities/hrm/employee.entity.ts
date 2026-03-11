import { DomainException } from '../../../exceptions/domain.exception';
import { BaseEntity } from '../base.entity';

export class Employee extends BaseEntity {
    private _userId:string;
    private _baseSalary:number;
    private _effectiveFrom:Date;

    constructor(
        id: string, 
        userId: string, 
        baseSalary: number, 
        effectiveFrom: Date, 
        createdAt: Date = new Date()
    ) {
        super(id, createdAt);
        this._userId = userId;
        this._baseSalary = baseSalary;
        this._effectiveFrom = effectiveFrom;
        this.validate();
    }

    get userId(): string { return this._userId; }
    set userId(value: string) { this._userId = value; }

    get baseSalary(): number { return this._baseSalary; }
    set baseSalary(value: number) { this._baseSalary = value; }

    get effectiveFrom(): Date { return this._effectiveFrom; }
    set effectiveFrom(value: Date) { this._effectiveFrom = value; }

    private validate(): void {
        if (!this._userId || this._userId.length < 3) {
            throw new DomainException('User ID must be at least 3 characters long.');
        }
        if (!this._baseSalary || this._baseSalary < 0) {
            throw new DomainException('Base salary must be a positive number.');
        }
        if (!this._effectiveFrom) {
            throw new DomainException('Effective from date is required.');
        }
    }

    public updateSalary(newSalary: number, effectiveDate: Date): void {
        if (newSalary <= 0) {
            throw new DomainException('New salary must be positive.');
        }
        if (!effectiveDate) {
            throw new DomainException('Effective date is required.');
        }
        // Có thể thêm logic: effectiveDate không được nhỏ hơn ngày hiện tại quá khứ...
        this._baseSalary = newSalary;
        this._effectiveFrom = effectiveDate;
    }
}
