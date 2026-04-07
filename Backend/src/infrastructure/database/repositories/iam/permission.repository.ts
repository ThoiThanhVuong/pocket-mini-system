import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPermissionRepository } from '../../../../core/interfaces/repositories/iam/permission.repository.interface';
import { Permission as PermissionEntity } from '../../entities/iam/permission.entity';
import { Permission as PermissionDomain } from 'src/core/domain/entities/iam/permission.entity';
import { PermissionCode } from '../../../../core/domain/enums/permission-code.enum';
import { DeepPartial } from '../../../../core/interfaces/repositories/base.repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepo: Repository<PermissionEntity>
    ) {}

    async findByCode(code: string): Promise<PermissionDomain | null> {
        const entity = await this.permissionRepo.findOne({ where: { permissionCode: code } });
        return entity ? this.toDomain(entity) : null;
    }

    async findAll(): Promise<PermissionDomain[]> {
        const entities = await this.permissionRepo.find();
        return entities.map(e => this.toDomain(e));
    }

    async save(data: PermissionDomain): Promise<PermissionDomain> {
        const entity = new PermissionEntity();
        entity.id = data.id;
        entity.permissionCode = data.permissionCode;
        entity.description = data.description;
        // Permission name is same as code in Infra entity currently
        
        await this.permissionRepo.save(entity);
        return data;
    }

    // Implementing other methods to satisfy Interface
    create(data: DeepPartial<PermissionDomain>): PermissionDomain {
        throw new Error('Method create not implemented.');
    }
    createMany(data: DeepPartial<PermissionDomain>[]): PermissionDomain[] {
        throw new Error('Method createMany not implemented.');
    }
    async saveMany(data: any[]): Promise<PermissionDomain[]> {
        throw new Error('Method saveMany not implemented.');
    }
    async findOneById(id: any): Promise<PermissionDomain | null> {
        const entity = await this.permissionRepo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByCondition(filterCondition: any): Promise<PermissionDomain | null> {
        throw new Error('Method findByCondition not implemented.');
    }
    async findWithRelations(relations: any): Promise<PermissionDomain[]> {
        throw new Error('Method findWithRelations not implemented.');
    }
    async remove(data: PermissionDomain): Promise<PermissionDomain> {
        throw new Error('Method remove not implemented.');
    }

    private toDomain(entity: PermissionEntity): PermissionDomain {
        return new PermissionDomain(
            entity.id,
            entity.permissionCode as PermissionCode,
            entity.permissionCode, // Name fallback
            entity.description,
            entity.createdAt
        );
    }
}
