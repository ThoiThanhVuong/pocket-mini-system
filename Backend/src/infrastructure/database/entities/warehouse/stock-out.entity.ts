import { BaseEntity } from "../base.entity";
import { Customer } from "../partners/customer.entity";
import { StockOutItem } from "./stock-out-item.entity";
import { User } from "../iam/user.entity";
import { Warehouse } from "./warehouse.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
@Entity('stock_out')
export class StockOut extends BaseEntity{
  @ManyToOne(()=> Customer,(Customer)=> Customer.stockOuts)
  @JoinColumn({name:'customer_id'})
  customer:Customer;

  @ManyToOne(()=> Warehouse,(Warehouse)=> Warehouse.stockOut)
  @JoinColumn({name:'warehouse_id'})
  warehouse :Warehouse;

  @ManyToOne(()=> User,(User)=>User.StockOuts)
  @JoinColumn({name:'user_id'})
  user:User;

  @Column({name:'reference_code'})
  referenceCode:string;

  @Column({default: 'pending'})
  status:string;

  @OneToMany(()=> StockOutItem ,(StockOutItem)=>StockOutItem.stockOut)
  stockOutItems:StockOutItem[];
 
}