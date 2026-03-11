import { Product } from "./product.entity";
import { Warehouse } from "./warehouse.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Index } from "typeorm";

@Entity('stock')
@Index('idx_stock_product', ['product']) 
@Index('idx_stock_warehouse', ['warehouse']) 
export class Stock {
    @PrimaryColumn({ name: 'warehouse_id' })
    warehouseId: string;

    @PrimaryColumn({ name: 'product_id' })
    productId: string;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.stock, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Warehouse;

    @ManyToOne(() => Product, (product) => product.stock, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'quantity', default: 0 })
    quantity: number;
}