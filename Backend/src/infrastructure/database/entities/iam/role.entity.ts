
import { Permission } from "./permission.entity";
import { BaseEntity } from "../base.entity";
import {  Column, Entity, JoinTable, ManyToMany } from "typeorm"
@Entity('roles')
export class Role extends BaseEntity {
    @Column({name : 'role_code',unique : true})
    code : string;

    @Column({name : 'name'})
    name : string;

    @Column({name : 'description'})
    description : string;

    @Column({name : 'base_salary', type: 'numeric', precision: 12, scale: 2, default: 0})
    baseSalary : number;

    @Column({name : 'salary_type', type: 'varchar', default: 'MONTHLY'})
    salaryType : string;

    @ManyToMany(()=> Permission, { cascade: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn:{name: 'role_id', referencedColumnName:'id'},
        inverseJoinColumn:{name:'permission_id',referencedColumnName:'id'}
    })
    permissions: Permission[];
}