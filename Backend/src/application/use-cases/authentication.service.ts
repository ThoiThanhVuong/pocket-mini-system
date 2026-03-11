import { IAuthenticationService } from "../../core/interfaces/services/auth.service.interface";
import type { IUserRepository } from "../../core/interfaces/repositories/user.repository.interface";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "../../application/dtos/iam/login.dto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { HashingServiceKey, type IHashingService } from "../../core/interfaces/services/hashing.service.interface";
import { Email } from "src/core/domain/value-objects/email.value-object";

@Injectable()
export class AuthenticationService implements IAuthenticationService {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,

        @Inject(HashingServiceKey)
        private readonly hashingService: IHashingService,
    ) {}

    async login(loginDto: LoginDto): Promise<{ 
        accessToken: string; 
        user: { 
            id: string; 
            email: string; 
            fullName: string; 
            roles: string[]; 
            permissions: string[]; 
            warehouseIds: string[];
        } 
    }> {
       
        const user = await this.userRepository.findByEmail(new Email(loginDto.email));
        if (!user) {
            
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        

        // Check : So sánh mật khẩu
        const isPasswordValid = await this.hashingService.compare(loginDto.password,user.passwordHash);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
       // Check : Kiểm tra xem user có bị khóa không?
       if(user.status ==='banned'){
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
       }
       // tạo token
       const payload ={
        sub:user.id,
        email:user.email, // user.email is string (getter), no getValue()
        phone:user.phoneNumber,
        warehouseIds: user.warehouseIds || []
       }

        const token = await this.jwtService.signAsync(payload);
        
        // Flatten permissions from all roles
        const permissions = user.roles.flatMap(role => role.permissions.map(p => p.permissionCode));
        const roleCodes = user.roles.map(role => role.roleCode);

        return {
            accessToken: token,
            user: {
                id: user.id,
                email: user.email, // user.email is string
                fullName: user.fullName,
                roles: roleCodes,
                permissions: [...new Set(permissions)], // Remove duplicates
                warehouseIds: user.warehouseIds || []
            }
        };
    }

    async resetAdminPassword(): Promise<string> {
        const adminEmail = 'admin@example.com';
        const newPassword = '123456';
        
        // 1. Hash new password
        const hash = await this.hashingService.hash(newPassword);

        // 2. Find user
        const user = await this.userRepository.findByEmail(new Email(adminEmail));
        if (!user) {
             return 'User admin@example.com not found. Create it first.';
        }
        
        // 3. Update password in Domain Entity
        user.changePassword(hash);

        // 4. Save to DB
        await this.userRepository.save(user);
        
        return `SUCCESS! Password for ${adminEmail} has been reset to: ${newPassword}`;
    }
}