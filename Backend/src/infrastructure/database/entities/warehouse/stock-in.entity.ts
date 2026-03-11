import { StockInItem } from "./stock-in-item.entity";
import { BaseEntity } from "../base.entity";
import { Supplier } from "../partners/supplier.entity";
import { User } from "../iam/user.entity";
import { Warehouse } from "./warehouse.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
@Entity('stock_in')
export class StockIn extends BaseEntity{
    @ManyToOne(()=>Supplier,(supplier)=>supplier.stockIn)
    @JoinColumn({name:'supplier_id'})
    supplier:Supplier;

    @ManyToOne(()=>Warehouse,(warehouse)=>warehouse.stockIn)
    @JoinColumn({name:'warehouse_id'})
    warehouse:Warehouse;

    @ManyToOne(()=>User,(user)=>user.StockIns)
    @JoinColumn({name:'user_id'})
    user:User;

    @Column({name:'reference_code'})
    referenceCode:string;

    @Column({default: 'pending'})
    status:string;

    @OneToMany(()=>StockInItem,(stockInItem)=>stockInItem.stockIn)
    stockInItems:StockInItem[];
}