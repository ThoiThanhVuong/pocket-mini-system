import { Category } from '../../../domain/entities/warehouse/category.entity';

export interface ICategoryService {
    createCategory(name: string, description?: string, image?: string, parentId?: string): Promise<Category>;
    updateCategory(id: string, name?: string, description?: string, image?: string, parentId?: string): Promise<Category>;
    deleteCategory(id: string): Promise<void>;
    getCategoryById(id: string): Promise<Category | null>;
    getAllCategories(search?: string): Promise<Category[]>;
    getChildren(parentId: string): Promise<Category[]>;
}

export const ICategoryServiceKey = 'ICategoryService';
