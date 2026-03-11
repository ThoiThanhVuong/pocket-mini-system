import { Column, Entity } from "typeorm";
import { BaseEntity } from "../base.entity";

@Entity('permissions')
export class Permission extends BaseEntity {
    @Column({name:'permission_code',unique:true})
    permissionCode: string;

    @Column({name:'description'})
    description: string;
}