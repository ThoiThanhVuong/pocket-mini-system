import { IBaseRepository, DeepPartial } from './base.repository.interface';
import { Category } from '../../domain/entities/warehouse/category.entity';

export interface ICategoryRepository extends IBaseRepository<Category> {
    // Override save với đúng kiểu Category
    save(category: Category): Promise<Category>;

    // Tìm theo parentId để lấy danh mục con
    findByParentId(parentId: string): Promise<Category[]>;

    // Tìm có lọc theo search (tên)
    findAllWithSearch(search?: string): Promise<Category[]>;
}
