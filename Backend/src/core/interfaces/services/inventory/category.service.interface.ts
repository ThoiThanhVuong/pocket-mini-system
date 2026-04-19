import { Category } from '../../../domain/entities/warehouse/category.entity';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

export interface ICategoryService {
    createCategory(name: string, description?: string, image?: string, parentId?: string): Promise<Category>;
    updateCategory(id: string, name?: string, description?: string, image?: string, parentId?: string): Promise<Category>;
    deleteCategory(id: string): Promise<void>;
    getCategoryById(id: string): Promise<Category | null>;
    getAllCategories(search?: string, options?: IPaginationOptions): Promise<IPaginatedResult<Category>>;
    getChildren(parentId: string): Promise<Category[]>;
}

export const ICategoryServiceKey = 'ICategoryService';
