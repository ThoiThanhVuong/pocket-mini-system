import { Entity, Column } from 'typeorm';
import { BaseEntity } from "../base.entity";

@Entity({ name: 'ai_models' })
export class AiModelEntity extends BaseEntity {
    @Column()
    provider: string;

    @Column({ name: 'model_name' })
    modelName: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    dims: number;
}
