import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base.entity";
@Entity('payments')
export class Payment extends BaseEntity{
    @Column({name:'reference_type'})
    referenceType:string;
    @Column({name:'reference_id'})
    referenceId:string;
    @Column({name:'amount'})
    amount:number;
    @Column({name:'method', nullable: true})
    method:string;
    @Column({name:'payment_description', nullable: true})
    paymentDescription:string;
    @Column({name:'paid_at', type: 'timestamptz', nullable: true})
    paidAt:Date;
    @Column({name:'status', default: 'pending'})
    status:string;
    
}