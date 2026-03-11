import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from "../base.entity";
import { AiRecommendationEntity } from './ai-recommendation.entity';
import { User } from "../iam/user.entity";

@Entity({ name: 'ai_feedback' })
export class AiFeedbackEntity extends BaseEntity {
    @Column({ name: 'recommendation_id', nullable: true })
    recommendationId: string;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @Column()
    rating: number;

    @Column({ nullable: true })
    comment: string;

    @ManyToOne(() => AiRecommendationEntity)
    @JoinColumn({ name: 'recommendation_id' })
    recommendation: AiRecommendationEntity;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
