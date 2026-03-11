import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from "../base.entity";
import { User } from "../iam/user.entity";
import { AiModelEntity } from "./ai-model.entity";

@Entity({ name: 'chat_threads' })
export class ChatThreadEntity extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column({ nullable: true })
    title: string;

    @Column({ name: 'model_id', nullable: true })
    modelId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => AiModelEntity)
    @JoinColumn({ name: 'model_id' })
    model: AiModelEntity;
}
