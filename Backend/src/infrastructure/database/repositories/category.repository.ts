import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category as CategoryEntity } from '../entities/warehouse/category.entity';
import { Category as CategoryDomain } from '../../../core/domain/entities/warehouse/category.entity';
import { ICategoryRepository } from '../../../core/interfaces/repositories/category.repository.interface';
import { DeepPartial } from '../../../core/interfaces/repositories/base.repository.interface';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly repo: Repository<CategoryEntity>,
    ) {}

    create(data: DeepPartial<CategoryDomain>): CategoryDomain {
        throw new Error("Use 'new Category(...)' + save() instead.");
    }

    createMany(data: DeepPartial<CategoryDomain>[]): CategoryDomain[] {
        throw new Error("Use 'new Category(...)' + save() instead.");
    }

    async save(category: CategoryDomain): Promise<CategoryDomain> {
       const entity = new CategoryEntity();
       entity.id = category.id;
       entity.name = category.name;
       entity.description = category.description;
       entity.image = category.image;
       entity.level = category.level;
       entity.parentId = category.parentId ? category.parentId : null;
       entity.createdAt = category.createdAt;
       entity.updatedAt = category.updatedAt;
        await this.repo.save(entity);
        return category;
    }

    async saveMany(data: CategoryDomain[]): Promise<CategoryDomain[]> {
        return Promise.all(data.map(c => this.save(c)));
    }

    async findOneById(id: string): Promise<CategoryDomain | null> {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findByCondition(filterCondition: any): Promise<CategoryDomain | null> {
        const entity = await this.repo.findOne({ where: filterCondition });
        return entity ? this.toDomain(entity) : null;
    }

    async findAll(): Promise<CategoryDomain[]> {
        const entities = await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }

    async findWithRelations(relations: any): Promise<CategoryDomain[]> {
        const entities = await this.repo.find({ relations });
        return entities.map(e => this.toDomain(e));
    }

    async remove(category: CategoryDomain): Promise<CategoryDomain> {
        await this.repo.delete(category.id);
        return category;
    }

    // ── ICategoryRepository extras ───────────────────────────────────

    async findAllWithSearch(search?: string): Promise<CategoryDomain[]> {
        const entities = search
            ? await this.repo.find({ where: { name: ILike(`%${search}%`) } })
            : await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }

    async findByParentId(parentId: string): Promise<CategoryDomain[]> {
        const entities = await this.repo.find({ where: { parentId } });
        return entities.map(e => this.toDomain(e));
    }

    // ── private helper ───────────────────────────────────────────────

    private toDomain(entity: CategoryEntity): CategoryDomain {
        return new CategoryDomain(
            entity.id,
            entity.name,
            entity.description,
            entity.image,
            entity.level,
            entity.parentId,
            entity.createdAt as Date,
            entity.updatedAt as Date,
        );
    }
}
