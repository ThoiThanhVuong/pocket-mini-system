import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards, Request, Query } from "@nestjs/common";
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { AuthGuard } from "@nestjs/passport";
import { IamServiceKey } from "../../../core/interfaces/services/iam/iam.service.interface";
import type { IIamService } from "../../../core/interfaces/services/iam/iam.service.interface";
import { RequirePermissions } from "src/infrastructure/auth/decorators/require-permissions.decorator";
import { PermissionCode } from "src/core/domain/enums/permission-code.enum";
import { CreateRoleDto } from "src/application/dtos/iam/create-role.dto";
import { CreateUserDto } from "src/application/dtos/iam/create-user.dto";
import { UpdateUserDto } from "src/application/dtos/iam/update-user.dto";
import { UpdateProfileDto } from "src/application/dtos/iam/update-profile.dto";
import { UserMapper } from "src/application/mappers/user.mapper";
import { RoleMapper, RoleResponseDto, PermissionResponseDto } from "src/application/mappers/role.mapper";

@Controller('iam')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class IamController {
    constructor(
        @Inject(IamServiceKey)
        private readonly iamService: IIamService,
    ) {}

    // tạo role mới
    @Post('roles')
    @RequirePermissions(PermissionCode.ROLE_CREATE)
    async createRole(@Body() body: CreateRoleDto) {
        const role = await this.iamService.createRole(body.name, body.description, body.baseSalary, body.salaryType);
        return RoleMapper.toResponse(role);
    }

    // Lấy tất cả roles
    @Get('roles')
    @RequirePermissions(PermissionCode.ROLE_VIEW)
    async getAllRoles() {
        const roles = await this.iamService.getAllRoles();
        return roles.map(role => RoleMapper.toResponse(role));
    }

    // Lấy role theo ID
    @Get('roles/:roleId')
    @RequirePermissions(PermissionCode.ROLE_VIEW)
    async getRoleById(@Param('roleId') roleId: string) {
        const role = await this.iamService.getRoleById(roleId);
        return RoleMapper.toResponse(role);
    }

    // Cập nhật role
    @Put('roles/:roleId')
    @RequirePermissions(PermissionCode.ROLE_UPDATE)
    async updateRole(@Param('roleId') roleId: string, @Body() body: { name: string; description?: string; baseSalary?: number; salaryType?: string }) {
        const role = await this.iamService.updateRole(roleId, body.name, body.description, body.baseSalary, body.salaryType);
        return RoleMapper.toResponse(role);
    }

    // Xóa role
    @Delete('roles/:roleId')
    @RequirePermissions(PermissionCode.ROLE_DELETE)
    async deleteRole(@Param('roleId') roleId: string) {
        return this.iamService.deleteRole(roleId);
    }

    // Gán permission cho role
    @Post('roles/:roleId/permissions/:permissionCode')
    @RequirePermissions(PermissionCode.ROLE_UPDATE)
    async assignPermissionToRole(@Param('roleId') roleId: string, @Param('permissionCode') permissionCode: string) {
        return this.iamService.assignPermissionToRole(roleId, permissionCode);
    }

    //  Gỡ Permission khỏi Role
    @Delete('roles/:roleId/permissions/:permissionCode')
    @RequirePermissions(PermissionCode.ROLE_UPDATE)
    async removePermissionFromRole(@Param('roleId') roleId: string, @Param('permissionCode') permissionCode: string) {
        return this.iamService.removePermissionFromRole(roleId, permissionCode);
    }

    // Gán Role cho User
    @Post('users/:userId/roles/:roleCode')
    @RequirePermissions(PermissionCode.USER_UPDATE)
    async assignRoleToUser(
        @Param('userId') userId: string,
        @Param('roleCode') roleCode: string
    ) {
        return this.iamService.assignRoleToUser(userId, roleCode);
    }

    // Gỡ Role khỏi User
    @Delete('users/:userId/roles/:roleCode')
    @RequirePermissions(PermissionCode.USER_UPDATE)
    async removeRoleFromUser(
        @Param('userId') userId: string,
        @Param('roleCode') roleCode: string
    ) {
        return this.iamService.removeRoleFromUser(userId, roleCode);
    }

    // Lấy danh sách Permission
    @Get('permissions')
    @RequirePermissions(PermissionCode.USER_VIEW)
    async getAllPermissions() {
        const permissions = await this.iamService.getAllPermission();
        return permissions.map(permission => RoleMapper.toPermissionResponse(permission));
    }

    @Post('users')
    @RequirePermissions(PermissionCode.USER_CREATE)
    async createUser(@Body() body: CreateUserDto) {
        const user = await this.iamService.createUser(body.email, body.password, body.fullName, body.phoneNumber, body.roleCode, body.baseSalary, body.salaryType, body.warehouseIds);
        return UserMapper.toResponse(user);
    }

    @Get('users')
    @RequirePermissions(PermissionCode.USER_VIEW)
    async getAllUsers(
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('status') status?: string,
    ) {
        const users = await this.iamService.getAllUsers(search, role, status);
        return users.map(user => UserMapper.toResponse(user));
    }

    @Get('users/:userId')
    @RequirePermissions(PermissionCode.USER_VIEW)
    async getUserById(@Param('userId') userId: string) {
        const user = await this.iamService.getUserById(userId);
        return UserMapper.toResponse(user);
    }

    @Put('users/:userId')
    @RequirePermissions(PermissionCode.USER_UPDATE)
    async updateUser(@Param('userId') userId: string, @Body() body: UpdateUserDto) {
        const user = await this.iamService.updateUser(userId, body.fullName, body.phoneNumber, body.status, body.roleCode, body.password, body.baseSalary, body.salaryType, body.warehouseIds);
        return UserMapper.toResponse(user);
    }

    @Delete('users/:userId')
    @RequirePermissions(PermissionCode.USER_DELETE)
    async deleteUser(@Param('userId') userId: string) {
        return this.iamService.deleteUser(userId);
    }

    // Profile (Self)
    @Get('profile')
    // @RequirePermissions(PermissionCode.PROFILE_VIEW) // Optional: restrict if needed
    async getProfile(@Request() req) {
        const userId = req.user.id;
        const user = await this.iamService.getUserById(userId);
        return UserMapper.toResponse(user);
    }

    @Put('profile')
    // @RequirePermissions(PermissionCode.PROFILE_UPDATE) // Optional: restrict if needed
    async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
        const userId = req.user.id;
        const user = await this.iamService.updateProfile(userId, body.fullName, body.phoneNumber, body.password);
        return UserMapper.toResponse(user);
    }
}
