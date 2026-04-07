import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IIamService } from '../../../core/interfaces/services/iam/iam.service.interface';
import type { IRoleRepository } from '../../../core/interfaces/repositories/iam/role.repository.interface';
import type { IUserRepository } from '../../../core/interfaces/repositories/iam/user.repository.interface';
import type { IPermissionRepository } from '../../../core/interfaces/repositories/iam/permission.repository.interface';
import type {IHashingService} from '../../../core/interfaces/services/iam/hashing.service.interface'
import { Role } from '../../../core/domain/entities/iam/role.entity';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { Permission } from '../../../core/domain/entities/iam/permission.entity';
import { v4 as uuidv4 } from 'uuid';
import { HashingServiceKey } from '../../../core/interfaces/services/iam/hashing.service.interface';
import { User } from '../../../core/domain/entities/iam/user.entity';
import { UserStatus } from '../../../core/domain/enums/user-status.enum';
import { Email } from 'src/core/domain/value-objects/email.value-object';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class IamService implements IIamService{
    constructor(
    @Inject('IRoleRepository') 
    private readonly roleRepo: IRoleRepository,
    
    @Inject('IUserRepository') 
    private readonly userRepo: IUserRepository,
    @Inject('IPermissionRepository') 
    private readonly permissionRepo: IPermissionRepository,

    @Inject(HashingServiceKey)
    private readonly hashingService: IHashingService,
  ) {}

    async createRole(name:string, description?:string, baseSalary?: number, salaryType?: string): Promise<Role> {
        //  Xử lý tiếng Việt có dấu -> không dấu
        const rawCode = name
            .normalize('NFD') // Tách dấu ra khỏi ký tự
            .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu
            .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Xử lý chữ đ/Đ
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_') // Thay thế ký tự đặc biệt/khoảng trắng bằng _
            .replace(/_+/g, '_'); // Gộp nhiều _ thành 1

        const code = rawCode as unknown as UserRole;
            
        const existing =await this.roleRepo.findByCode(code);
        if(existing){
            throw new BadRequestException('Role already exists');
        }
        //  Tạo Role Domain
        const role = new Role(
            uuidv4(),
            code,
            name,
            description || '',
            [],
            baseSalary || 0,
            (salaryType as any) || 'MONTHLY'
        );
        return await this.roleRepo.save(role);
    }

    async assignPermissionToRole(roleId:string,permissionCode:string):Promise<void>{
        //lấy role
        const role = await this.roleRepo.findOneById(roleId);
        if(!role){
            throw new NotFoundException('Role not found');
        }
        //lấy permission
        const permission = await this.permissionRepo.findByCode(permissionCode);
        if(!permission){
            throw new NotFoundException('Permission not found');
        }
        // thêm permission vào role
        role.addPermission(permission);
        await this.roleRepo.save(role);
    }

    async removePermissionFromRole(roleId: string, permissionCode: string): Promise<void> {
        const role =await this.roleRepo.findOneById(roleId);
        if(!role){
            throw new NotFoundException('Role not found');
        }
        const permission = await this.permissionRepo.findByCode(permissionCode);
        if(!permission){
            throw new NotFoundException('Permission not found');
        }
        role.removePermission(permission.id);
        await this.roleRepo.save(role);
    }

    // quản lý role user

    async assignRoleToUser(userId:string,roleCode:string):Promise<void>{
        const user = await this.userRepo.findOneById(userId);
        if(!user){
            throw new NotFoundException('User not found');
        }
        const role = await this.roleRepo.findByCode(roleCode);
        if(!role){
            throw new NotFoundException('Role not found');
        }
        user.assignRole(role);
        await this.userRepo.save(user);
    }

    async removeRoleFromUser(userId:string,roleCode:string):Promise<void>{
        const user = await this.userRepo.findOneById(userId);
        if(!user){
            throw new NotFoundException('User not found');
        }
        const role = await this.roleRepo.findByCode(roleCode);
        if(!role){
            throw new NotFoundException('Role not found');
        }
        user.removeRole(role.id);
        await this.userRepo.save(user);
    }

    async getAllRoles(): Promise<Role[]> {
        return await this.roleRepo.findAll();
    }
    
    async getAllPermission(): Promise<Permission[]> {
        return await this.permissionRepo.findAll();
    }

    async getRoleById(roleId: string): Promise<Role> {
        const role = await this.roleRepo.findOneById(roleId);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }

    async updateRole(roleId: string, name: string, description?: string, baseSalary?: number, salaryType?: string): Promise<Role> {
        const role = await this.roleRepo.findOneById(roleId);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        
        // Use the domain method to update
        // We preserve the existing roleCode as it's not being updated here
        role.updateRole(
            role.roleCode as any, 
            name, 
            description || '', 
            baseSalary, 
            salaryType as any
        );

        return await this.roleRepo.save(role);
    }

    async deleteRole(roleId: string): Promise<void> {
        const role = await this.roleRepo.findOneById(roleId);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        await this.roleRepo.remove(role);
    }

    // --- User Management ---

    async createUser(email: string, password: string, fullName: string, phoneNumber: string, roleCode?: string, baseSalary?: number, salaryType?: string, warehouseIds?: string[]): Promise<User> {
        const existingUser = await this.userRepo.findByEmail(new Email(email));
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        const passwordHash = await this.hashingService.hash(password);
        
        // Normalize empty phone number to null so it doesn't collide with other empty strings
        const cleanPhone = (phoneNumber && phoneNumber.trim() !== '') ? phoneNumber : null;

        if (cleanPhone) {
            const existingByPhone = await this.userRepo.findByPhoneNumber(cleanPhone);
            if (existingByPhone) {
                throw new BadRequestException('Số điện thoại này đã được sử dụng bởi một tài khoản khác.');
            }
        }

        // Using Mapper instead of direct instantiation
        const userDto = { email, fullName, phoneNumber: cleanPhone } as any; 
        const newUser = UserMapper.toDomain(userDto, passwordHash);
        
        if (roleCode) {
            const role = await this.roleRepo.findByCode(roleCode as UserRole); 
            if (role) {
                newUser.assignRole(role);
            }
        }

        if (baseSalary !== undefined) {
            newUser.baseSalary = baseSalary;
        }

        if (salaryType) {
            newUser.salaryType = salaryType as any;
        }

        if (warehouseIds) {
            newUser.setWarehouses(warehouseIds);
        }

        return await this.userRepo.save(newUser);
    }

    async getAllUsers(search?: string, role?: string, status?: string): Promise<User[]> {
        return await this.userRepo.findAllWithFilters(search, role, status);
    }

    async getUserById(userId: string): Promise<User> {
        const user = await this.userRepo.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateUser(userId: string, fullName?: string, phoneNumber?: string, status?: UserStatus, roleCode?: string, password?: string, baseSalary?: number, salaryType?: string, warehouseIds?: string[]): Promise<User> {
        const user = await this.userRepo.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');

        user.updateDetails(fullName, phoneNumber);

        if (password) {
            const passwordHash = await this.hashingService.hash(password);
            user.changePassword(passwordHash);
        }

        if (status) {
            if (status === UserStatus.ACTIVE) user.activate();
            else if (status === UserStatus.INACTIVE) user.deactivate();
            else if (status === UserStatus.BANNED) user.ban();
        }

        if (roleCode) {
            const role = await this.roleRepo.findByCode(roleCode as UserRole);
            if (role) {
                user.setRoles([role]);
            }
        }

        if (baseSalary !== undefined) {
             user.baseSalary = baseSalary;
        }

        if (salaryType) {
             // Assuming SalaryType enum matches string or needs casting/validation
             user.salaryType = salaryType as any; 
        }

        if (warehouseIds) {
             user.setWarehouses(warehouseIds);
        }

        return await this.userRepo.save(user);
    }

    async deleteUser(userId: string): Promise<void> {
        const user = await this.userRepo.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
        await this.userRepo.remove(user);
    }

    async updateProfile(userId: string, fullName?: string, phoneNumber?: string, password?: string): Promise<User> {
        const user = await this.userRepo.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
    
        user.updateDetails(fullName, phoneNumber);
    
        if (password) {
            const passwordHash = await this.hashingService.hash(password);
            user.changePassword(passwordHash);
        }
    
        return await this.userRepo.save(user);
    }

}
