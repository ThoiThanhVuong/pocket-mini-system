import { Stock } from "./stock.entity";
import { BaseEntity } from "../base.entity";
import { Column, Entity, OneToMany, ManyToMany } from "typeorm";
import { StockIn } from "./stock-in.entity";
import { StockOut } from "./stock-out.entity";
import { StockTransfer } from "./stock-transfer.entity";
import { User } from "../iam/user.entity";

@Entity('warehouses')
export class Warehouse extends BaseEntity{
    @Column({name:'name',nullable:false})
    name:string;

    @Column({name:'location'})
    location:string;

    @Column({ name: 'city', nullable: true })
    city: string;

    @Column({ name: 'country', nullable: true })
    country: string;

    @Column({ name: 'capacity', type: 'int', nullable: true })
    capacity: number;

    @Column({ name: 'manager', nullable: true })
    manager: string;

    @Column({ name: 'contact_info', nullable: true })
    contactInfo: string;

    @Column({ name: 'status', default: 'ACTIVE' })
    status: string;

    @OneToMany(()=>Stock,(stock)=>stock.warehouse)
    stock:Stock[];

    @OneToMany(()=>StockIn,(stockIn)=>stockIn.warehouse)
    stockIn:StockIn[];

    @OneToMany(()=>StockOut,(StockOut)=> StockOut.warehouse)
    stockOut:StockOut[];

    @OneToMany(() => StockTransfer, (stockTransfer) => stockTransfer.fromWarehouse)
    stockTransfersFrom: StockTransfer[];

    @OneToMany(() => StockTransfer, (stockTransfer) => stockTransfer.toWarehouse)
    stockTransfersTo: StockTransfer[];

    @ManyToMany(() => User, (user) => user.warehouses)
    users: User[];
}