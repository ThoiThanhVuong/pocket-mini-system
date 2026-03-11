import { BaseEntity } from "../base.entity";
import { Product } from "./product.entity";
import { StockIn } from "./stock-in.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('stock_in_items')
export class StockInItem extends BaseEntity{
    @ManyToOne(()=> StockIn,(StockIn)=> StockIn.stockInItems)
    @JoinColumn({name:'stock_in_id'})
    stockIn:StockIn;

    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(()=> Product,(product)=> product.stockInItems)
    @JoinColumn({name:'product_id'})
    product:Product;

    @Column({name:'quantity'})
    quantity:number;

    @Column({name:'price'})
    price:number;
}