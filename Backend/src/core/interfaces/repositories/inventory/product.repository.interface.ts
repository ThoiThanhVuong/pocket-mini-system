import { Product } from "../../../domain/entities/warehouse/product.entity";
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";
import { IBaseRepository } from "../base.repository.interface";

export interface IProductRepository extends IBaseRepository<Product>{
    findBySku(sku:string):Promise<Product|null>;
    save(product:Product):Promise<Product>;
    findAllWithFilters(search?:string, isActive?:boolean, categoryId?: string | string[], options?: IPaginationOptions): Promise<IPaginatedResult<Product>>;
}