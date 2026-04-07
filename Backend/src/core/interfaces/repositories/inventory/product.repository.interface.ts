import { Product } from "../../../domain/entities/warehouse/product.entity";
import { IBaseRepository } from "../base.repository.interface";

export interface IProductRepository extends IBaseRepository<Product>{
    findBySku(sku:string):Promise<Product|null>;
    save(product:Product):Promise<Product>;
    findAllWithFilters(search?:string,isActive?:boolean,categoryId?:string):Promise<Product[]>;
}