import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../core/interfaces/repositories/iam/user.repository.interface';
import { User as UserEntity } from '../../entities/iam/user.entity';
import { Role as RoleEntity } from '../../entities/iam/role.entity'; // Import RoleEntity
import { User as UserDomain } from '../../../../core/domain/entities/iam/user.entity';
import { Role as RoleDomain } from '../../../../core/domain/entities/iam/role.entity';
import { Permission as PermissionDomain } from '../../../../core/domain/entities/iam/permission.entity';
import { UserRole } from '../../../../core/domain/enums/user-role.enum';
import { PermissionCode } from '../../../../core/domain/enums/permission-code.enum';
import { DeepPartial } from '../../../../core/interfaces/repositories/base.repository.interface';
import { UserStatus } from '../../../../core/domain/enums/user-status.enum';
import { Email } from '../../../../core/domain/value-objects/email.value-object';
import { Warehouse as WarehouseEntity } from '../../entities/warehouse/warehouse.entity';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: Email): Promise<UserDomain | null> {
    const userEntity = await this.userRepo.findOne({ 
        where: { email: email.getValue() },
        relations: ['roles', 'roles.permissions', 'warehouses'] 
    });
    if (!userEntity) return null;
    return this.toDomain(userEntity);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserDomain | null> {
    const userEntity = await this.userRepo.findOne({ 
        where: { phoneNumber },
        relations: ['roles', 'roles.permissions', 'warehouses'] 
    });
    if (!userEntity) return null;
    return this.toDomain(userEntity);
  }

  create(data: DeepPartial<UserDomain>): UserDomain {
      throw new Error("Method not implemented. Use 'new User(...)' and 'save()' instead.");
  }
  createMany(data: DeepPartial<UserDomain>[]): UserDomain[] {
      throw new Error("Method not implemented. Use 'new User(...)' and 'save()' instead.");
  }

  async save(user: UserDomain): Promise<UserDomain> {
       const entity = new UserEntity();
       entity.id = user.id;
       entity.email = user.email;
       entity.passwordHash = user.passwordHash;
       entity.fullName = user.fullName || '';
       entity.phoneNumber = user.phoneNumber || '';
       entity.status = user.status;
       
       // Map domain roles to entity roles for persistence
       if (user.roles && user.roles.length > 0) {
           entity.roles = user.roles.map(r => {
               const roleEntity = new RoleEntity();
               roleEntity.id = r.id;
               return roleEntity;
           });
       } else {
           entity.roles = [];
       }
       
       if (user.warehouseIds && user.warehouseIds.length > 0) {
           entity.warehouses = user.warehouseIds.map(wId => {
               const warehouseEntity = new WarehouseEntity();
               warehouseEntity.id = wId;
               return warehouseEntity;
           });
       } else {
           entity.warehouses = [];
       }
       
       await this.userRepo.save(entity);
       return user;
  }
  
  async saveMany(data: any[]): Promise<UserDomain[]> {
      throw new Error("Method not implemented.");
  }

  async findOneById(id: any): Promise<UserDomain | null> {
       const entity = await this.userRepo.findOne({ 
           where: { id },
           relations: ['roles', 'roles.permissions', 'warehouses']
        });
       return entity ? this.toDomain(entity) : null;
  }

  async findByCondition(filterCondition: any): Promise<UserDomain | null> {
       throw new Error("Method not implemented.");
  }

  async findWithRelations(relations: any): Promise<UserDomain[]> {
       throw new Error("Method not implemented.");
  }

  async findAll(): Promise<UserDomain[]> {
      const entities = await this.userRepo.find({
        where: { status: UserStatus.ACTIVE },
          relations: ['roles', 'roles.permissions', 'warehouses'],
          order: { createdAt: 'DESC' }
      });
      return entities.map(e => this.toDomain(e));
  }

  async remove(data: UserDomain): Promise<UserDomain> {
      const entity = await this.userRepo.findOne({ where: { id: data.id } });
      if (!entity) throw new Error('User not found');
      
      entity.status = UserStatus.INACTIVE;
      const savedEntity = await this.userRepo.save(entity);
      
      return this.toDomain(savedEntity);
  }

  // Mapper
  private toDomain(entity: UserEntity): UserDomain {
    const roles = entity.roles ? entity.roles.map(roleEntity => {
        const permissions = roleEntity.permissions ? roleEntity.permissions.map(p => 
            new PermissionDomain(
                p.id,
                p.permissionCode as PermissionCode,
                p.permissionCode,
                p.description,
                p.createdAt
            )
        ) : [];

        return new RoleDomain(
             roleEntity.id,
             roleEntity.code as UserRole,
             roleEntity.name,
             roleEntity.description,
             permissions,
             Number(roleEntity.baseSalary) || 0,
             (roleEntity.salaryType as any) || 'MONTHLY',
             roleEntity.createdAt
        );
    }) : [];

    const warehouseIds = entity.warehouses ? entity.warehouses.map(w => w.id) : [];

    return new UserDomain(
      entity.id,
      new Email(entity.email),
      entity.phoneNumber,
      entity.fullName,
      entity.passwordHash,
      entity.status as UserStatus,
      Number(entity.baseSalary), 
      (entity.salaryType as any) || 'MONTHLY',
      roles,
      warehouseIds,
      entity.createdAt,
      entity.updatedAt
    );
  }

  async findAllWithFilters(search?: string, role?: string, status?: string, options?: IPaginationOptions): Promise<IPaginatedResult<UserDomain>> {
    const query = this.userRepo.createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .leftJoinAndSelect('user.warehouses', 'warehouse');

    if (search) {
        query.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)', { search: `%${search}%` });
    }

    if (role) {
        query.andWhere('role.code = :role', { role });
    }

    if (status) {
        query.andWhere('user.status = :status', { status });
    }

    if (options) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        query.skip(skip).take(limit);

        if (options.sortBy) {
            query.orderBy(`user.${options.sortBy}`, options.sortOrder || 'ASC');
        } else {
            query.orderBy('user.createdAt', 'DESC');
        }

        const [entities, totalItems] = await query.getManyAndCount();
        const items = entities.map(e => this.toDomain(e));

        return {
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page
            }
        };
    }

    query.orderBy('user.createdAt', 'DESC');
    const entities = await query.getMany();
    const items = entities.map(e => this.toDomain(e));
    
    return {
        items,
        meta: {
            totalItems: items.length,
            itemCount: items.length,
            itemsPerPage: items.length || 10,
            totalPages: 1,
            currentPage: 1
        }
    };
  }
}
