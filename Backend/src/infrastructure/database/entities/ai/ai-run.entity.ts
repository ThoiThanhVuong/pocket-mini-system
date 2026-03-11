import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from "../base.entity";
import { User } from "../iam/user.entity"; // Assuming User entity exists
import { AiModelEntity } from './ai-model.entity';

@Entity({ name: 'ai_runs' })
export class AiRunEntity extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column({ name: 'model_id', nullable: true })
    modelId: string;

    @Column()
    task: string;

    @Column({ type: 'jsonb', nullable: true })
    input: any;

    @Column({ type: 'jsonb', nullable: true })
    output: any;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => AiModelEntity)
    @JoinColumn({ name: 'model_id' })
    model: AiModelEntity;
}
