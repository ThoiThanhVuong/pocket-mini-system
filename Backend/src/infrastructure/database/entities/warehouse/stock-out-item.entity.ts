import { BaseEntity } from "../base.entity";
import { Product } from "./product.entity";
import { StockOut } from "./stock-out.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
@Entity('stock_out_items')
export class StockOutItem extends BaseEntity{
    @ManyToOne(()=> StockOut,(StockOut)=>StockOut.stockOutItems)
    @JoinColumn({name:'stock_out_id'})
    stockOut:StockOut;

    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(()=> Product,(product)=>product.stockOutItems)
    @JoinColumn({name:'product_id'})
    product:Product;

    @Column({name:'quantity'})
    quantity:number;

    @Column({name:'price'})
    price:number;
}