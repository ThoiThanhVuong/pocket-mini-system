import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Category } from "./category.entity";
import { BaseEntity } from "../base.entity";
import { Stock } from "./stock.entity";
import { StockInItem } from "./stock-in-item.entity";
import { StockOutItem } from "./stock-out-item.entity";
import { StockTransferItem } from "./stock-transfer-item.entity";

@Entity('products')
export class Product extends BaseEntity{
    @Column({name:'sku',unique:true})
    sku:string;

    @Column({name:'name'})
    name:string;

    @Column({name:'description'})
    description :string;

    @Column({name:'image'})
    image:string;

    @Column({ name: 'category_id', type: 'uuid', nullable: true })
    categoryId: string | null;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({name:'unit'})
    unit:string;

    @Column({name:'price'})
    price:number;

    @Column({name:'is_active',default:true})
    isActive:boolean;

    @Column({name:'min_stock_level', default: 0})
    minStockLevel: number;

    @OneToMany(()=>Stock,(stock)=>stock.product)
    stock:Stock[];

    @OneToMany(()=>StockInItem,(stockInItem)=>stockInItem.product)
    stockInItems:StockInItem[];

    @OneToMany(()=> StockOutItem,(StockOutItem)=> StockOutItem.product)
    stockOutItems:StockOutItem[];

    @OneToMany(()=>StockTransferItem,(stockTransferItem)=>stockTransferItem.product)
    stockTransferItems:StockTransferItem[];
}