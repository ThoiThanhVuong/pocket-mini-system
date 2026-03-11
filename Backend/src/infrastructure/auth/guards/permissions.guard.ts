import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';
import { User } from '../../../core/domain/entities/iam/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('--- PermissionsGuard.canActivate Triggered ---');
    console.log('Handler:', context.getHandler().name);
    // Lấy danh sách quyền được yêu cầu từ Decorator
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCode[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Nếu API không yêu cầu quyền gì cả -> Cho qua luôn
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('PermissionsGuard - Pass (No permissions required)');
      return true; 
    }
    
    // Lấy User từ Request (Đã được JwtStrategy gắn vào trước đó)
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; 
 
    if (!user) {
        throw new UnauthorizedException('User not authenticated');
    }
    // Kiểm tra xem User có Roles chưa
    if (!user.roles) {
       
         throw new ForbiddenException('User roles are not loaded. Cannot check permissions.');
    }
    // Gộp tất cả quyền từ các Roles của User lại thành 1 danh sách
    const userPermissions = user.roles.flatMap(role => role.permissions.map(p => p.permissionCode));
    
    // Debug Logging
    console.log('--- PermissionsGuard Debug ---');
    console.log('User:', user.email);
    console.log('User Roles:', user.roles.map(r => r.name));
    console.log('User Permissions:', userPermissions);
    console.log('Required Permissions:', requiredPermissions);
    
    // Kiểm tra xem User có đủ quyền không
    // Chuyển từ AND (every) sang OR (some) để linh hoạt hơn
    // Nếu API yêu cầu [A, B] -> User có A HOẶC B là được.
    const hasPermission = requiredPermissions.some(code => userPermissions.includes(code));

    if (!hasPermission) {
        console.warn('MISSING PERMISSIONS!', requiredPermissions);
        throw new ForbiddenException('You do not have the required permissions to access this resource');
    }

    return true;
  }
}
