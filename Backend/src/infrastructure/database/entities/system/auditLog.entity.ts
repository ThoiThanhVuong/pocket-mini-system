import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../base.entity";
import { User } from "../iam/user.entity";

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    declare id: string; // Override BaseEntity uuid

    @ManyToOne(()=>User,(user)=>user.AuditLogs)
    @JoinColumn({name:'user_id'})
    user:User;

    @Column({name:'entity_type'})
    entityType:string;

    @Column({name:'entity_id', type: 'uuid'})
    entityId:string;

    @Column({name:'action'})
    action:string;

    @Column({ type: 'jsonb', nullable: true })
    changes: Record<string, any>; 
}