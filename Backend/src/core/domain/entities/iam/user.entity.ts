import { BaseEntity } from '../base.entity';
import { UserStatus } from '../../enums/user-status.enum';
import { Role } from './role.entity';
import { PermissionCode } from '../../enums/permission-code.enum';
import { Email } from '../../value-objects/email.value-object';
import { DomainException } from '../../../exceptions/domain.exception';
import { SalaryType } from '../../enums/salary-type.enum';

export class User extends BaseEntity {
    private _email: Email;
    private _phoneNumber: string | null;
    private _fullName: string;
    private _passwordHash: string;
    private _status: UserStatus;
    private _baseSalary: number;
    private _salaryType: SalaryType;
    private _roles: Role[];
    private _warehouseIds: string[];

    constructor(
        id: string,
        email: Email,
        phoneNumber: string | null,
        fullName: string,
        passwordHash: string,
        status: UserStatus = UserStatus.ACTIVE,
        baseSalary: number = 0,
        salaryType: SalaryType = SalaryType.MONTHLY,
        roles: Role[] = [],
        warehouseIds: string[] = [],
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(id, createdAt, updatedAt);
        this._email = email;
        this._phoneNumber = phoneNumber;
        this._fullName = fullName;
        this._passwordHash = passwordHash;
        this._status = status;
        this._baseSalary = baseSalary;
        this._salaryType = salaryType;
        this._roles = roles;
        this._warehouseIds = warehouseIds;
        this.validate();
    }    

    // Business Logic Validation
    private validate(): void {
        if (!this._email) {
            throw new DomainException('Invalid email address.');
        }
        // Phone number validation logic can be added here
        // if (this._phoneNumber && ...) 
        
        if (!this._passwordHash) {
            throw new DomainException('Password hash is required.');
        }
    }

    // Encapsulation - Getters only (or setters with business rules)
    get email(): string { return this._email.getValue(); }
    get phoneNumber(): string | null { return this._phoneNumber; }
    get fullName(): string { return this._fullName; }
    get passwordHash(): string { return this._passwordHash; }
    get status(): UserStatus { return this._status; }
    get baseSalary(): number { return this._baseSalary; }
    set baseSalary(value: number) { this._baseSalary = value; }
    get salaryType(): SalaryType { return this._salaryType; }
    set salaryType(value: SalaryType) { this._salaryType = value; }
    get roles(): Role[] { return this._roles; }
    get warehouseIds(): string[] { return this._warehouseIds; }

    // Domain Behavior
    public changePassword(newPasswordHash: string): void {
        if (!newPasswordHash) {
            throw new DomainException('New password hash cannot be empty.');
        }
        this._passwordHash = newPasswordHash;
    }

    public activate(): void {
        this._status = UserStatus.ACTIVE;
    }

    public deactivate(): void {
        this._status = UserStatus.INACTIVE;
    }

    public ban(): void {
        this._status = UserStatus.BANNED;
    }

    public changeEmail(newEmail: string): void {
        this._email = new Email(newEmail);
    }

    public assignRole(role: Role): void {
        if (!this._roles.find(r => r.id === role.id)) {
            this._roles.push(role);
        }
    }

    public removeRole(roleId: string): void {
        this._roles = this._roles.filter(r => r.id !== roleId);
    }

    public setRoles(roles: Role[]): void {
        this._roles = roles;
    }

    public assignWarehouse(warehouseId: string): void {
        if (!this._warehouseIds.includes(warehouseId)) {
            this._warehouseIds.push(warehouseId);
        }
    }

    public removeWarehouse(warehouseId: string): void {
        this._warehouseIds = this._warehouseIds.filter(id => id !== warehouseId);
    }

    public setWarehouses(warehouseIds: string[]): void {
        this._warehouseIds = warehouseIds;
    }

    public hasPermission(permissionCode: PermissionCode): boolean {
        return this._roles.some(role => 
            role.permissions.some(permission => permission.permissionCode === permissionCode)
        );
    }

    public updateDetails(fullName?: string, phoneNumber?: string): void {
        if (fullName !== undefined) this._fullName = fullName;
        if (phoneNumber !== undefined) this._phoneNumber = phoneNumber;
    }
}
