import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../database/repositories/user.repository';
import { User } from '../database/entities/iam/user.entity';
import { Role } from '../database/entities/iam/role.entity';
import { Permission } from '../database/entities/iam/permission.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Role, Permission]), // Cần thiết để UserRepository hoạt động
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // Cấu hình cách tạo Token
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }
        return {
          secret: secret,
          signOptions: { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
        };
      },
    }),
  ],
  providers: [
      JwtStrategy,
      {
          provide: 'IUserRepository',
          useClass: UserRepository
      }
  ],
  exports: [JwtModule, PassportModule, 'IUserRepository'], // Export để module khác dùng lại nếu cần
})
export class AuthModule {}