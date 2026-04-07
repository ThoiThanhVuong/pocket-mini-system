import { Permission } from '../../../domain/entities/iam/permission.entity';
import { IBaseRepository } from '../base.repository.interface';

export interface IPermissionRepository extends IBaseRepository<Permission> {
    findByCode(code: string): Promise<Permission | null>;
}
