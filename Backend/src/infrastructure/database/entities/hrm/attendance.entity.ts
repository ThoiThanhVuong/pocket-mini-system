import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "../base.entity";
import { User } from "../iam/user.entity";

@Entity('attendance')
@Unique(['userId', 'date'])
export class Attendance extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'date' })
    date: Date;

    @Column({ name: 'check_in', type: 'timestamp', nullable: true })
    checkIn: Date | null;

    @Column({ name: 'check_out', type: 'timestamp', nullable: true })
    checkOut: Date | null;

    @Column({ name: 'working_hours', type: 'numeric', precision: 4, scale: 2, default: 0 })
    workingHours: number;

    @Column({ name: 'overtime_hours', type: 'numeric', precision: 4, scale: 2, default: 0 })
    overtimeHours: number;

    @Column({ default: 'PRESENT' })
    status: string;

    @Column({ nullable: true })
    note: string;
}
