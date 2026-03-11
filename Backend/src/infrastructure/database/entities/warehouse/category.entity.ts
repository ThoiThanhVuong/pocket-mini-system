import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../base.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    image: string;

    @Column({ default: 0 })
    level: number;

    @Column({ name: 'parent_id', type: 'uuid', nullable: true })
    parentId: string | null;

    @ManyToOne(() => Category, (category) => category.children)
    @JoinColumn({ name: 'parent_id' })
    parent: Category;

    @OneToMany(() => Category, (category) => category.parent)
    children: Category[];

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
