import { StockIn } from "../warehouse/stock-in.entity";
import { BaseEntity } from "../base.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('suppliers')
export class Supplier extends BaseEntity{
    @Column({name:'name'})
    name:string;

    @Column({name:'contact_person'})
    contactPerson:string;

    @Column({name:'phone'})
    phone:string;

    @Column({name:'email'})
    email:string;

    @Column({name:'address'})
    address:string;

    @Column({name:'status'})
    status:string;

    @OneToMany(()=>StockIn,(stockIn)=>stockIn.supplier)
    stockIn:StockIn[];
}