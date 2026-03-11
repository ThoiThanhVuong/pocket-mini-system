export interface Attendance {
    id: string;
    userId: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    workingHours: number;
    overtimeHours?: number;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE';
    note?: string;
}