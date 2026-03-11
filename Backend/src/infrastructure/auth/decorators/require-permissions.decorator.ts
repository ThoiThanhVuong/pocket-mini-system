import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionCode[]) => SetMetadata(PERMISSIONS_KEY, permissions);
