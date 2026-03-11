import { BaseEntity } from '../base.entity';
import { PermissionCode } from '../../enums/permission-code.enum';
import { DomainException } from '../../../exceptions/domain.exception';

export class Permission extends BaseEntity {
    private _permissionCode: PermissionCode;
    private _name: string;
    private _description: string;

    constructor(
        id: string, 
        permissionCode: PermissionCode, 
        name: string, 
        description: string, 
        createdAt: Date = new Date()
    ) {
        super(id, createdAt);
        this._permissionCode = permissionCode;
        this._name = name;
        this._description = description;
        this.validate();
    }

    get permissionCode(): PermissionCode { return this._permissionCode; }
    get name(): string { return this._name; }
    get description(): string { return this._description; }

    private validate(): void {
        if (!this._permissionCode) {
            throw new DomainException('Permission code is required.');
        }
        if (!this._name || this._name.length < 3) {
            throw new DomainException('Name must be at least 3 characters long.');
        }
    }

    public updatePermission(permissionCode: PermissionCode, name: string, description: string): void {
        this._permissionCode = permissionCode;
        this._name = name;
        this._description = description;
        this.validate();
    }
}
