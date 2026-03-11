import { Column, Entity, JoinColumn, ManyToOne, OneToMany, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../iam/user.entity';
import { Warehouse } from './warehouse.entity';
import { StockTransferItem } from './stock-transfer-item.entity';

@Entity('stock_transfer')
export class StockTransfer extends BaseEntity {
  @ManyToOne(() => Warehouse,(Warehouse)=>Warehouse.stockTransfersFrom)
  @JoinColumn({ name: 'from_warehouse' }) 
  fromWarehouse: Warehouse;

  @ManyToOne(() => Warehouse,(Warehouse)=>Warehouse.stockTransfersTo)
  @JoinColumn({ name: 'to_warehouse' }) 
  toWarehouse: Warehouse;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'reference_code', nullable: true })
  referenceCode: string;

  @Column({ name: 'status', default: 'pending' })
  status: string;

  @OneToMany(() => StockTransferItem, (item) => item.stockTransfer)
  stockTransferItems: StockTransferItem[];

}
