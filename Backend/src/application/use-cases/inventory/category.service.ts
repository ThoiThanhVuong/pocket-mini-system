import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICategoryService } from '../../../core/interfaces/services/inventory/category.service.interface';
import type { ICategoryRepository } from '../../../core/interfaces/repositories/inventory/category.repository.interface';
import type { IProductRepository } from '../../../core/interfaces/repositories/inventory/product.repository.interface';
import { Category } from '../../../core/domain/entities/warehouse/category.entity';
import { CategoryMapper } from '../../mappers/category.mapper';
import { CreateCategoryDto } from '../../dtos/catalog/create-category.dto';
import { IPaginationOptions, IPaginatedResult } from "../../../shared/types/pagination.type";

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject('ICategoryRepository')
        private readonly repo: ICategoryRepository,
        @Inject('IProductRepository')
        private readonly productRepo: IProductRepository,
    ) {}

    async createCategory(
        name: string,
        description?: string,
        image?: string,
        parentId?: string,
    ): Promise<Category> {
        // Nếu có parentId → tính level tự động
        let level = 0;
        if (parentId) {
            const parent = await this.repo.findOneById(parentId);
            if (!parent) {
                throw new BadRequestException(`Danh mục cha với id "${parentId}" không tồn tại`);
            }
            level = parent.level + 1;
        }

        const dto: CreateCategoryDto = { name, description, image, parentId };
        const category = CategoryMapper.toDomain(dto, level);
        return await this.repo.save(category);
    }

    async updateCategory(
        id: string,
        name?: string,
        description?: string,
        image?: string,
        parentId?: string,
    ): Promise<Category> {
        const category = await this.repo.findOneById(id);
        if (!category) throw new NotFoundException('Không tìm thấy danh mục');

        // Cập nhật từng trường nếu được cung cấp
        if (name !== undefined)        category.name = name;
        if (description !== undefined) category.description = description;
        if (image !== undefined)       category.image = image;

        // Nếu đổi parentId → cập nhật lại level
        if (parentId !== undefined) {
            if (parentId === null) {
                category.parentId = null;
                category.level = 0;
            } else {
                if (parentId === id) {
                    throw new BadRequestException('Danh mục không thể là cha của chính nó');
                }
                const parent = await this.repo.findOneById(parentId);
                if (!parent) throw new BadRequestException(`Danh mục cha "${parentId}" không tồn tại`);
                category.parentId = parentId;
                category.level = parent.level + 1;
            }
        }

        return await this.repo.save(category);
    }

    async deleteCategory(id: string): Promise<void> {
        const category = await this.repo.findOneById(id);
        if (!category) throw new NotFoundException('Không tìm thấy danh mục');

        // #3: Kiểm tra có danh mục con không
        const children = await this.repo.findByParentId(id);
        if (children.length > 0) {
            throw new BadRequestException(
                `Không thể xóa danh mục "${category.name}" vì còn ${children.length} danh mục con. Hãy xóa hoặc chuyển danh mục con trước.`
            );
        }

        // #3: Kiểm tra có sản phẩm thuộc danh mục không
        const products = await this.productRepo.findAllWithFilters(undefined, undefined, id, { page: 1, limit: 1 });
        if (products.meta.totalItems > 0) {
            throw new BadRequestException(
                `Không thể xóa danh mục "${category.name}" vì còn ${products.meta.totalItems} sản phẩm thuộc danh mục này. Hãy chuyển sản phẩm sang danh mục khác trước.`
            );
        }

        await this.repo.remove(category);
    }

    async getCategoryById(id: string): Promise<Category | null> {
        return await this.repo.findOneById(id);
    }

    async getAllCategories(search?: string, options?: IPaginationOptions): Promise<IPaginatedResult<Category>> {
        return await this.repo.findAllWithSearch(search, options);
    }

    async getChildren(parentId: string): Promise<Category[]> {
        return await this.repo.findByParentId(parentId);
    }
}
