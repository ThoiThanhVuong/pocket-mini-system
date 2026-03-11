import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../infrastructure/database/entities/iam/user.entity';

// Auth Infra
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { BcryptService } from '../../infrastructure/external-services/bcrypt.service';
import { HashingServiceKey } from '../../core/interfaces/services/hashing.service.interface';

// Application Logic
import { AuthenticationService } from '../../application/use-cases/authentication.service';
import { AuthenticationServiceKey } from '../../core/interfaces/services/auth.service.interface';

// Presentation
import { AuthenticationController } from '../../presentation/controllers/authentication.controller';

// Repositories
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { RoleRepository } from '../../infrastructure/database/repositories/role.repository';
import { PermissionRepository } from '../../infrastructure/database/repositories/permission.repository';

import { Role } from '../../infrastructure/database/entities/iam/role.entity';
import { Permission } from '../../infrastructure/database/entities/iam/permission.entity';

import { IamController } from '../../presentation/controllers/iam.controller';
import { IamService } from '../../application/use-cases/iam.service';
import { IamServiceKey } from '../../core/interfaces/services/iam.service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
    AuthModule, // Provides JwtModule, PassportModule
  ],
  controllers: [AuthenticationController,IamController],
  providers: [
    // Bind Interface -> Implementation
    {
      provide: HashingServiceKey,
      useClass: BcryptService,
    },
    {
      provide: AuthenticationServiceKey,
      useClass: AuthenticationService,
    },
    {
      provide: 'IUserRepository', // Token used in AuthenticationService @Inject
      useClass: UserRepository,
    },
    // --- IAM Providers [NEW] ---
    {
        provide: IamServiceKey,
        useClass: IamService
    },
    {
        provide: 'IRoleRepository',
        useClass: RoleRepository
    },
    {
        provide: 'IPermissionRepository',
        useClass: PermissionRepository
    }
  ],
})
export class IamModule {}
