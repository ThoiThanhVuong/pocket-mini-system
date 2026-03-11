import { BaseEntity } from '../base.entity';
import { UserRole } from '../../enums/user-role.enum';
import { Permission } from './permission.entity';
import { DomainException } from '../../../exceptions/domain.exception';
import { SalaryType } from '../../enums/salary-type.enum';

export class Role extends BaseEntity {
    private _roleCode: UserRole;
    private _name: string;
    private _description: string;
    private _baseSalary: number;
    private _salaryType: SalaryType;
    private _permissions: Permission[];

    constructor(
        id: string, 
        roleCode: UserRole, 
        name: string, 
        description: string, 
        permissions: Permission[] = [], 
        baseSalary: number = 0,
        salaryType: SalaryType = SalaryType.MONTHLY,
        createdAt: Date = new Date()
     ) {
     super(id, createdAt);
     this._roleCode = roleCode;
     this._name = name;
     this._description = description;
     this._permissions = permissions;
     this._baseSalary = baseSalary;
     this._salaryType = salaryType;
     this.validate();
    }

    get roleCode(): string { return this._roleCode; }
    get name(): string { return this._name; }
    get description(): string { return this._description; }
    get baseSalary(): number { return this._baseSalary; }
    get salaryType(): SalaryType { return this._salaryType; }
    get permissions(): Permission[] { return this._permissions; }

    private validate(): void {
     if (!this._roleCode || this._roleCode.length < 3) {
         throw new DomainException('Role code must be at least 3 characters long.');
     }
     if (!this._name || this._name.length < 3) {
         throw new DomainException('Name must be at least 3 characters long.');
     }
    }

    public updateRole(roleCode: UserRole, name: string, description: string, baseSalary?: number, salaryType?: SalaryType): void {
     this._roleCode = roleCode;
     this._name = name;
     this._description = description;
     if (baseSalary !== undefined) this._baseSalary = baseSalary;
     if (salaryType !== undefined) this._salaryType = salaryType;
     this.validate();
    }

    public addPermission(permission: Permission): void {
        if (!this._permissions.find(p => p.id === permission.id)) {
            this._permissions.push(permission);
        }
    }

    public removePermission(permissionId: string): void {
        this._permissions = this._permissions.filter(p => p.id !== permissionId);
    }
}
