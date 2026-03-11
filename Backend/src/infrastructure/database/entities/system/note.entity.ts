import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../base.entity";
import { User } from "../iam/user.entity";

@Entity('notes')
export class Note extends BaseEntity{
    @Column({name:'entity_type'})
    entityType:string;

    @Column({name:'entity_id'})
    entityId:string;

    @ManyToOne(()=>User,(user)=> user.Notes)
    @JoinColumn({name:'user_id'})
    user:User;

    @Column({name:'title', nullable: true})
    title: string;

    @Column({name:'content'})
    content:string;

    @Column({name:'is_important', default: false})
    isImportant: boolean;
}