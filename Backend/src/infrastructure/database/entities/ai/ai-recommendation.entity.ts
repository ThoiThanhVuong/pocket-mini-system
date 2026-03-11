import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from "../base.entity";
import { Product } from "../warehouse/product.entity";

@Entity({ name: 'ai_recommendations' })
export class AiRecommendationEntity extends BaseEntity {
    @Column({ name: 'product_id', nullable: true })
    productId: string;

    @Column({ name: 'suggested_qty' })
    suggestedQty: number;

    @Column({ nullable: true })
    reason: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
