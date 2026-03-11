import { BaseEntity } from '../base.entity';
import { DomainException } from '../../../exceptions/domain.exception';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    LATE = 'LATE',
    ABSENT = 'ABSENT',
    LEAVE = 'LEAVE'
}

export class Attendance extends BaseEntity {
    private _userId: string;
    private _date: Date;
    private _checkIn: Date | null;
    private _checkOut: Date | null;
    private _workingHours: number;
    private _overtimeHours: number;
    private _status: AttendanceStatus;
    private _note: string;

    constructor(
        id: string,
        userId: string,
        date: Date,
        checkIn: Date | null,
        checkOut: Date | null,
        workingHours: number,
        overtimeHours: number,
        status: AttendanceStatus,
        note: string,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(id, createdAt, updatedAt);
        this._userId = userId;
        this._date = date;
        this._checkIn = checkIn;
        this._checkOut = checkOut;
        this._workingHours = workingHours;
        this._overtimeHours = overtimeHours;
        this._status = status;
        this._note = note;
        this.validate();
    }

    // Getters & Setters
    get userId(): string { return this._userId; }
    get date(): Date { return this._date; }
    get checkIn(): Date | null { return this._checkIn; }
    get checkOut(): Date | null { return this._checkOut; }
    get workingHours(): number { return this._workingHours; }
    get overtimeHours(): number { return this._overtimeHours; }
    set overtimeHours(value: number) { this._overtimeHours = value; }
    get status(): AttendanceStatus { return this._status; }
    get note(): string { return this._note; }

    checkInNow(time: Date, lateThresholdHour: number = 7): void {
        if (this._checkIn) {
            throw new DomainException('Already checked in for today.');
        }
        this._checkIn = time;
        // Logic to determine status (e.g., if time >= lateThresholdHour -> LATE)
        // Default is 7 (7:00 AM)
        const checkInHour = time.getHours();
        const checkInMinute = time.getMinutes();
        
        // Example: Threshold 7. 
        // 7:00 is On Time (or Late? Usually 7:01 is Late, or > 7:00).
        // Let's assume strict > 7:00 is late.
        // If hour > 7, definitely late.
        // If hour == 7 and minute > 0, late.
        
        if (checkInHour > lateThresholdHour || (checkInHour === lateThresholdHour && checkInMinute > 0)) {
            this._status = AttendanceStatus.LATE;
        } else {
            this._status = AttendanceStatus.PRESENT;
        }
    }

    checkOutNow(time: Date): void {
        if (!this._checkIn) {
            throw new DomainException('Cannot check out without check-in.');
        }
        this._checkOut = time;
        // Calculate working hours
        const diffMs = this._checkOut.getTime() - this._checkIn.getTime();
        this._workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    public updateManual(checkIn?: Date, checkOut?: Date, overtimeHours?: number, note?: string): void {
        if (checkIn) this._checkIn = checkIn;
        if (checkOut) this._checkOut = checkOut;
        if (overtimeHours !== undefined) this._overtimeHours = overtimeHours;
        if (note !== undefined) this._note = note;

        // Recalculate working hours if both exist
        if (this._checkIn && this._checkOut) {
            const diffMs = this._checkOut.getTime() - this._checkIn.getTime();
            this._workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        }
    }

    public markAsLeave(reason: string): void {
        if (this._status === AttendanceStatus.PRESENT && this._checkIn) {
            // Nghiệp vụ: Nếu đã check-in nhưng sau đó xin nghỉ (ví dụ: nghỉ ốm giữa giờ)
            // Hiện tại cho phép ghi đè trạng thái.
        }
        this._status = AttendanceStatus.LEAVE;
        this._note = reason;
        // Để đơn giản: Khi đánh dấu là Nghỉ phép, trạng thái ngày đó sẽ là LEAVE.
        // Các dữ liệu check-in/out cũ (nếu có) vẫn được giữ lại để tham khảo nhưng không tính công.
    }

    private validate(): void {
        if (!this._userId) throw new DomainException('User ID is required.');
        if (!this._date) throw new DomainException('Date is required.');
    }
}
