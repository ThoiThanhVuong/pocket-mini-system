import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "../base.entity";
import { User } from "../iam/user.entity";

@Entity('payroll')
@Unique(['userId', 'month', 'year'])
export class Payroll extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({ name: 'total_working_days', type: 'numeric', precision: 4, scale: 2 })
    totalWorkingDays: number;

    @Column({ name: 'base_salary', type: 'numeric', precision: 12, scale: 2 })
    baseSalary: number;

    @Column({ name: 'total_salary', type: 'numeric', precision: 12, scale: 2 })
    totalSalary: number;

    @Column({ name: 'total_normal_hours', type: 'numeric', precision: 5, scale: 2, default: 0 })
    totalNormalHours: number;

    @Column({ name: 'total_ot_hours', type: 'numeric', precision: 5, scale: 2, default: 0 })
    totalOtHours: number;

    @Column({ name: 'hourly_rate', type: 'numeric', precision: 12, scale: 2, default: 0 })
    hourlyRate: number;

    @Column({ default: 'DRAFT' })
    status: string;
}
