import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse as WarehouseEntity } from '../../entities/warehouse/warehouse.entity';
import { Warehouse as WarehouseDomain } from '../../../../core/domain/entities/warehouse/warehouse.entity';
import { IWarehouseRepository } from '../../../../core/interfaces/repositories/inventory/warehouse.repository.interface';
import { DeepPartial } from '../../../../core/interfaces/repositories/base.repository.interface';
import { v4 as uuidv4 } from 'uuid';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
    constructor(
        @InjectRepository(WarehouseEntity)
        private readonly repo: Repository<WarehouseEntity>,
    ) {}

    async save(domain: WarehouseDomain): Promise<WarehouseDomain> {
        const entity = this.toEntity(domain);
        await this.repo.save(entity);
        return domain;
    }

    async findOneById(id: string): Promise<WarehouseDomain | null> {
        const e = await this.repo.findOne({ where: { id } });
        return e ? this.toDomain(e) : null;
    }

    async findAll(): Promise<WarehouseDomain[]> {
        const list = await this.repo.find();
        return list.map(e => this.toDomain(e));
    }

    async remove(domain: WarehouseDomain): Promise<WarehouseDomain> {
        await this.repo.delete(domain.id);
        return domain;
    }

    async findByName(name: string): Promise<WarehouseDomain | null> {
        const e = await this.repo.findOne({ where: { name } });
        return e ? this.toDomain(e) : null;
    }

    async findByCode(code: string): Promise<WarehouseDomain | null> {
        const e = await this.repo.findOne({ where: { name: code } });
        return e ? this.toDomain(e) : null;
    }

    async findWarehousesByUserId(userId: string): Promise<WarehouseDomain[]> {
        const list = await this.repo.createQueryBuilder('warehouse')
            .innerJoin('warehouse.users', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
        return list.map(e => this.toDomain(e));
    }

    async findAllPaginated(options?: IPaginationOptions, allowedIds?: string[], search?: string, status?: string): Promise<IPaginatedResult<WarehouseDomain>> {
        const query = this.repo.createQueryBuilder('warehouse');
        
        if (allowedIds && allowedIds.length > 0) {
            query.where('warehouse.id IN (:...allowedIds)', { allowedIds });
        } else if (allowedIds && allowedIds.length === 0) {
            // User is not allowed any warehouses
            return {
                items: [],
                meta: { totalItems: 0, itemCount: 0, itemsPerPage: options?.limit || 10, totalPages: 0, currentPage: options?.page || 1 }
            };
        }

        if (search) {
            query.andWhere('(LOWER(warehouse.name) LIKE LOWER(:search) OR LOWER(warehouse.location) LIKE LOWER(:search) OR LOWER(warehouse.city) LIKE LOWER(:search))', { search: `%${search}%` });
        }

        if (status) {
            query.andWhere('warehouse.status = :status', { status });
        }

        if (options) {
            if (options.sortBy) {
                query.orderBy(`warehouse.${options.sortBy}`, options.sortOrder || 'ASC');
            } else {
                query.orderBy('warehouse.createdAt', 'DESC');
            }
            // Add search filtering if provided through options as hack, or better wait, I need to pass filters.
            const page = options.page || 1;
            const limit = options.limit || 10;
            const skip = (page - 1) * limit;

            query.skip(skip).take(limit);

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

    create(data: DeepPartial<WarehouseDomain>): WarehouseDomain { throw new Error('Not implemented'); }
    createMany(data: DeepPartial<WarehouseDomain>[]): WarehouseDomain[] { throw new Error('Not implemented'); }
    async saveMany(data: WarehouseDomain[]): Promise<WarehouseDomain[]> { return Promise.all(data.map(d => this.save(d))); }
    async findByCondition(f: any): Promise<WarehouseDomain | null> { throw new Error('Not implemented'); }
    async findWithRelations(r: any): Promise<WarehouseDomain[]> { throw new Error('Not implemented'); }

    private toEntity(d: WarehouseDomain): WarehouseEntity {
        const e = new WarehouseEntity();
        e.id = d.id;
        e.name = d.name;
        e.location = d.location;
        if (d.city !== undefined) e.city = d.city;
        if (d.country !== undefined) e.country = d.country;
        if (d.capacity !== undefined) e.capacity = d.capacity;
        if (d.manager !== undefined) e.manager = d.manager;
        if (d.contactInfo !== undefined) e.contactInfo = d.contactInfo;
        if (d.status !== undefined) e.status = d.status;
        e.createdAt = d.createdAt;
        return e;
    }

    private toDomain(e: WarehouseEntity): WarehouseDomain {
        return new WarehouseDomain(
            e.id, 
            e.name, 
            e.location, 
            e.city, 
            e.country, 
            e.capacity !== undefined && e.capacity !== null && e.capacity < 0 ? 0 : e.capacity, 
            e.manager, 
            e.contactInfo, 
            e.status, 
            e.createdAt as Date
        );
    }
}
