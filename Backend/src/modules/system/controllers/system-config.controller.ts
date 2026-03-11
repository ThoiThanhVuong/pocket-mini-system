
import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';
import { SystemConfigService } from '../services/system-config.service';

@Controller('system/config')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SystemConfigController {
    constructor(private readonly service: SystemConfigService) {}

    @Get()
    @RequirePermissions(PermissionCode.SYSTEM_VIEW, PermissionCode.SYSTEM_SETTINGS) 
    async getConfig(@Query('key') key: string) {
        return await this.service.getConfig(key, '');
    }

    @Put()
    @RequirePermissions(PermissionCode.SYSTEM_UPDATE, PermissionCode.SYSTEM_SETTINGS)
    async updateConfig(@Body() body: { key: string; value: string; description?: string }) {
        return await this.service.setConfig(body.key, body.value, body.description);
    }

    @Get('group')
    @RequirePermissions(PermissionCode.SYSTEM_VIEW, PermissionCode.SYSTEM_SETTINGS)
    async getConfigs(@Query('keys') keys: string) {
        // Expect keys to be comma separated
        const keyList = keys ? keys.split(',') : [];
        return await this.service.getConfigs(keyList);
    }
}
