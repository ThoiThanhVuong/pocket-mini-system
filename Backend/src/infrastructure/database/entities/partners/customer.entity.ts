import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../base.entity";
import { StockOut } from "../warehouse/stock-out.entity";
@Entity('customers')
export class Customer extends BaseEntity{
    @Column({name:'name'})
    name:string;

    @Column({name:'phone'})
    phone:string;

    @Column({name:'email', unique: true})
    email:string;

    @Column({name:'address'})
    address:string;

    @Column({name:'status'})
    status:string;

    @Column({name: 'customer_type', nullable: true})
    customerType: string;

    @Column({name: 'company_name', nullable: true})
    companyName: string;

    @Column({name: 'tier', default: 'Bronze'})
    loyaltyTier: string;

    @OneToMany(()=> StockOut,(StockOut)=> StockOut.customer)
    stockOuts:StockOut[];
}