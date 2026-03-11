import { Role } from "../../core/domain/entities/iam/role.entity";
import { Permission } from "../../core/domain/entities/iam/permission.entity";

export class PermissionResponseDto {
  id: string;
  permissionCode: string;
  name: string;
  description: string;
  createdAt: Date;
}

export class RoleResponseDto {
  id: string;
  roleCode: string;
  name: string;
  description: string;
  permissions: PermissionResponseDto[];
  baseSalary?: number;
  salaryType?: string;
  createdAt: Date;
}

export class RoleMapper {
    static toResponse(role: Role): RoleResponseDto {
        return {
            id: role.id,
            roleCode: role.roleCode,
            name: role.name,
            description: role.description,
            baseSalary: role.baseSalary,
            salaryType: role.salaryType,
            permissions: role.permissions ? role.permissions.map(p => this.toPermissionResponse(p)) : [],
            createdAt: role.createdAt
        };
    }

    static toPermissionResponse(permission: Permission): PermissionResponseDto {
        return {
            id: permission.id,
            permissionCode: permission.permissionCode,
            name: permission.name,
            description: permission.description,
            createdAt: permission.createdAt
        };
    }
}
