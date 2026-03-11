import { BaseEntity } from '../base.entity';
import { DomainException } from '../../../exceptions/domain.exception';

export enum PayrollStatus {
    DRAFT = 'DRAFT',
    FINALIZED = 'FINALIZED',
    PAID = 'PAID'
}

export class Payroll extends BaseEntity {
    private _userId: string;
    private _month: number;
    private _year: number;
    private _totalWorkingDays: number;
    private _baseSalary: number;
    private _totalSalary: number;
    private _totalNormalHours: number;
    private _totalOtHours: number;
    private _hourlyRate: number;
    private _status: PayrollStatus;
    private _user?: any; // To store user relation if loaded

    constructor(
        id: string,
        userId: string,
        month: number,
        year: number,
        totalWorkingDays: number,
        baseSalary: number,
        totalSalary: number,
        totalNormalHours: number,
        totalOtHours: number,
        hourlyRate: number,
        status: PayrollStatus,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
        user?: any
    ) {
        super(id, createdAt, updatedAt);
        this._userId = userId;
        this._month = month;
        this._year = year;
        this._totalWorkingDays = totalWorkingDays;
        this._baseSalary = baseSalary;
        this._totalSalary = totalSalary;
        this._totalNormalHours = totalNormalHours;
        this._totalOtHours = totalOtHours;
        this._hourlyRate = hourlyRate;
        this._status = status;
        this._user = user;
        this.validate();
    }

    // Getters
    get userId(): string { return this._userId; }
    get month(): number { return this._month; }
    get year(): number { return this._year; }
    get totalWorkingDays(): number { return this._totalWorkingDays; }
    get baseSalary(): number { return this._baseSalary; }
    get totalSalary(): number { return this._totalSalary; }
    get totalNormalHours(): number { return this._totalNormalHours; }
    get totalOtHours(): number { return this._totalOtHours; }
    get hourlyRate(): number { return this._hourlyRate; }
    get status(): PayrollStatus { return this._status; }
    get user(): any { return this._user; }

    updateMetrics(
        totalWorkingDays?: number,
        totalSalary?: number,
        totalNormalHours?: number,
        totalOtHours?: number,
        hourlyRate?: number
    ) {
        if (totalWorkingDays !== undefined) this._totalWorkingDays = totalWorkingDays;
        if (totalSalary !== undefined) this._totalSalary = totalSalary;
        if (totalNormalHours !== undefined) this._totalNormalHours = totalNormalHours;
        if (totalOtHours !== undefined) this._totalOtHours = totalOtHours;
        if (hourlyRate !== undefined) this._hourlyRate = hourlyRate;
    }

    finalize(): void {
        if (this._status === PayrollStatus.PAID) {
            throw new DomainException('Payroll is already paid.');
        }
        this._status = PayrollStatus.FINALIZED;
    }

    markAsPaid(): void {
        this._status = PayrollStatus.PAID;
    }

    private validate(): void {
        if (!this._userId) throw new DomainException('User ID is required.');
        if (this._month < 1 || this._month > 12) throw new DomainException('Invalid month.');
    }
}
