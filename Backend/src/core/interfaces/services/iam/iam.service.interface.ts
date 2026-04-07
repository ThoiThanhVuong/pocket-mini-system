import { Permission } from "../../../domain/entities/iam/permission.entity";
import { Role } from "../../../domain/entities/iam/role.entity";
import { User } from "../../../domain/entities/iam/user.entity";
import { UserStatus } from "../../../domain/enums/user-status.enum";

export interface IIamService{
    // Role Management
    createRole(name:string, description?:string, baseSalary?: number, salaryType?: string):Promise<Role>
    getAllRoles():Promise<Role[]>
    getRoleById(roleId: string): Promise<Role>
    updateRole(roleId: string, name: string, description?: string, baseSalary?: number, salaryType?: string): Promise<Role>
    deleteRole(roleId: string): Promise<void>
    assignPermissionToRole(roleId:string,permissionCode:string):Promise<void>
    removePermissionFromRole(roleId:string,permissionCode:string):Promise<void>
    // User Role Management
    assignRoleToUser(userId:string,roleCode:string):Promise<void>
    removeRoleFromUser(userId:string,roleCode:string):Promise<void>
    getAllPermission():Promise<Permission[]>

    // User Management
    createUser(email: string, password: string, fullName: string, phoneNumber?: string, roleCode?: string, baseSalary?: number, salaryType?: string, warehouseIds?: string[]): Promise<User>;
    getAllUsers(search?: string, role?: string, status?: string): Promise<User[]>;
    getUserById(userId: string): Promise<User>;
    updateUser(userId: string, fullName?: string, phoneNumber?: string, status?: UserStatus, roleCode?: string, password?: string, baseSalary?: number, salaryType?: string, warehouseIds?: string[]): Promise<User>;
    deleteUser(userId: string): Promise<void>;

    // Profile
    updateProfile(userId: string, fullName?: string, phoneNumber?: string, password?: string): Promise<User>;
}
export const IamServiceKey = 'IIamService';
