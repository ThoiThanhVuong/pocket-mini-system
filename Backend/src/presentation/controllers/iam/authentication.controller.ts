import { Controller, Post, Get, Body, Inject, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../../../application/dtos/iam/login.dto';
import { AuthenticationServiceKey } from '../../../core/interfaces/services/iam/auth.service.interface';
import { RequirePermissions } from '../../../infrastructure/auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../infrastructure/auth/guards/permissions.guard';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';
import type { IAuthenticationService } from '../../../core/interfaces/services/iam/auth.service.interface';
// import { ApiResponse } from '../../../shared/dtos/api-response.dto'; // Using standard response if available

@Controller('auth')
export class AuthenticationController {
  constructor(
    @Inject(AuthenticationServiceKey)
    private readonly authService: IAuthenticationService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return result; 
    // Interceptor will wrap this in { success: true, data: result } if properly configured
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(PermissionCode.USER_VIEW)
  getProfile(@Request() req) {
      return req.user;
  }

  // Temporary endpoint for debugging/fixing password
  @Get('reset-admin')
  // @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  // @RequirePermissions(PermissionCode.SYSTEM_SETTINGS)
  async resetAdmin() {
      return await this.authService.resetAdminPassword();
  }
}
