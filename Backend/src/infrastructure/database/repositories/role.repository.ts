import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../../../core/interfaces/repositories/role.repository.interface';
import { Role as RoleEntity } from '../entities/iam/role.entity'; // ORM Entity
import { Role as RoleDomain } from '../../../core/domain/entities/iam/role.entity'; // Domain Entity
import { Permission as PermissionDomain } from '../../../core/domain/entities/iam/permission.entity';
import { PermissionCode } from '../../../core/domain/enums/permission-code.enum';
import { UserRole } from '../../../core/domain/enums/user-role.enum';
import { DeepPartial } from '../../../core/interfaces/repositories/base.repository.interface';
import { Permission as PermissionEntity } from '../entities/iam/permission.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async findByCode(code: string): Promise<RoleDomain | null> {
    const entity = await this.roleRepo.findOne({
      where: { code },
      relations: ['permissions'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<RoleDomain | null> {
    const entity = await this.roleRepo.findOne({
      where: { name },
      relations: ['permissions'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findOneById(id: string): Promise<RoleDomain | null> {
    const entity = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(options?: any): Promise<RoleDomain[]> {
    const entities = await this.roleRepo.find({
        relations: ['permissions'],
        ...options 
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async save(role: RoleDomain): Promise<RoleDomain> {
    const entity = new RoleEntity();
    entity.id = role.id;
    entity.code = role.roleCode; 
    entity.name = role.name;
    entity.description = role.description;
    entity.baseSalary = role.baseSalary;
    entity.salaryType = role.salaryType;
    
    if (role.permissions) {
      entity.permissions = role.permissions.map(p => {
          const permEntity = new PermissionEntity();
          permEntity.id = p.id;
          return permEntity;
      });
    }

    await this.roleRepo.save(entity);
    return role;
  }

  // --- Methods below can be implemented as needed ---
  
  create(data: DeepPartial<RoleDomain>): RoleDomain {
    throw new Error('Method not implemented.');
  }
  createMany(data: DeepPartial<RoleDomain>[]): RoleDomain[] {
    throw new Error('Method not implemented.');
  }
  async saveMany(data: any[]): Promise<RoleDomain[]> {
    throw new Error('Method not implemented.');
  }
  async findByCondition(filterCondition: any): Promise<RoleDomain | null> {
    throw new Error('Method not implemented.');
  }
  async findWithRelations(relations: any): Promise<RoleDomain[]> {
    throw new Error('Method not implemented.');
  }
  async remove(data: RoleDomain): Promise<RoleDomain> {
      // Logic to remove...
      // await this.roleRepo.delete(data.id);
      // return data;
      throw new Error('Method not implemented.');
  }

  // Mapper
  private toDomain(entity: RoleEntity): RoleDomain {
    const permissions = entity.permissions
      ? entity.permissions.map((p) => {
          return new PermissionDomain(
            p.id,
            p.permissionCode as PermissionCode,
            p.permissionCode, // Name fallback
            p.description,
            p.createdAt,
          );
        })
      : [];

    return new RoleDomain(
      entity.id,
      entity.code as UserRole,
      entity.name,
      entity.description,
      permissions,
      Number(entity.baseSalary) || 0,
      (entity.salaryType as any) || 'MONTHLY', // Cast or import SalaryType
      entity.createdAt,
    );
  }
}
