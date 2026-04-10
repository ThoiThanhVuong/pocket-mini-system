import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('user_salary_history')
export class UserSalaryHistory extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'old_role_name', nullable: true })
    oldRoleName: string;

    @Column({ name: 'new_role_name', nullable: true })
    newRoleName: string;

    @Column({ name: 'old_base_salary', type: 'decimal', default: 0 })
    oldBaseSalary: number;

    @Column({ name: 'new_base_salary', type: 'decimal', default: 0 })
    newBaseSalary: number;

    @Column({ name: 'effective_date', type: 'date' })
    effectiveDate: string;

    @Column({ name: 'reason', nullable: true })
    reason: string;
}
