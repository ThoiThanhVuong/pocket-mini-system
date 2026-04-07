import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../infrastructure/database/entities/iam/user.entity';

// Auth Infra
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { BcryptService } from '../../infrastructure/external-services/bcrypt.service';
import { HashingServiceKey } from '../../core/interfaces/services/iam/hashing.service.interface';

// Application Logic
import { AuthenticationService } from '../../application/use-cases/iam/authentication.service';
import { AuthenticationServiceKey } from '../../core/interfaces/services/iam/auth.service.interface';

// Presentation
import { AuthenticationController } from '../../presentation/controllers/iam/authentication.controller';

// Repositories
import { UserRepository } from '../../infrastructure/database/repositories/iam/user.repository';
import { RoleRepository } from '../../infrastructure/database/repositories/iam/role.repository';
import { PermissionRepository } from '../../infrastructure/database/repositories/iam/permission.repository';

import { Role } from '../../infrastructure/database/entities/iam/role.entity';
import { Permission } from '../../infrastructure/database/entities/iam/permission.entity';

import { IamController } from '../../presentation/controllers/iam/iam.controller';
import { IamService } from '../../application/use-cases/iam/iam.service';
import { IamServiceKey } from '../../core/interfaces/services/iam/iam.service.interface';

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
