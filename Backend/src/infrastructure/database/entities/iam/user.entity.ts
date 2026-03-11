import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Role } from './role.entity';
import { StockIn } from '../warehouse/stock-in.entity';
import { StockOut } from '../warehouse/stock-out.entity';
import { StockTransfer } from '../warehouse/stock-transfer.entity';
import { Note } from '../system/note.entity';
import { AuditLog } from '../system/auditLog.entity';
import { Warehouse } from '../warehouse/warehouse.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, type: 'citext' })
  email: string;

  @Column({ name: 'phone_number', nullable: true, unique: true })
  phoneNumber: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'base_salary', type: 'numeric', precision: 12, scale: 2, default: 0 })
  baseSalary: number;

  @Column({ name: 'salary_type', type: 'varchar', default: 'MONTHLY' })
  salaryType: string;

  @Column({ default: 'active' })
  status: string;



  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ManyToMany(() => Warehouse)
  @JoinTable({
    name: 'user_warehouses',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'warehouse_id', referencedColumnName: 'id' },
  })
  warehouses: Warehouse[];



  @OneToMany(()=> StockIn,stockIn=> stockIn.user)
  StockIns : StockIn[];

  @OneToMany(()=> StockOut,(StockOut)=> StockOut.user)
  StockOuts : StockOut[];

  @OneToMany(()=> StockTransfer,(StockTransfer)=> StockTransfer.user)
  StockTransfers : StockTransfer[];

  @OneToMany(()=> Note,(note)=> note.user)
  Notes : Note[];

  @OneToMany(()=> AuditLog,(auditLog)=> auditLog.user)
  AuditLogs : AuditLog[];
}
