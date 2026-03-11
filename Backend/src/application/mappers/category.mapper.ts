import { Category } from '../../core/domain/entities/warehouse/category.entity';
import { CreateCategoryDto } from '../dtos/catalog/create-category.dto';
import { CategoryResponseDto } from '../dtos/catalog/category-response.dto';
import { v4 as uuidv4 } from 'uuid';

export class CategoryMapper {
    /**
     * Chuyển DTO đầu vào → Domain Entity (dùng khi tạo mới)
     */
    static toDomain(dto: CreateCategoryDto, level: number = 0): Category {
        return new Category(
            uuidv4(),
            dto.name,
            dto.description ?? '',
            dto.image ?? '',
            level,
            dto.parentId ?? '',
            new Date(),
            new Date(),
        );
    }

    /**
     * Chuyển Domain Entity → Response DTO (trả về cho client)
     */
    static toResponse(category: Category): CategoryResponseDto {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            image: category.image,
            level: category.level,
            parentId: category.parentId,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}
