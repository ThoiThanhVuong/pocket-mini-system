import { Product } from "../../domain/entities/warehouse/product.entity";

export interface IProductService {
    createProduct(name:string,sku:string,price:number,description:string,image:string,categoryId:string,unit:string,minStock:number):Promise<Product>;
    updateProduct(id:string,data:Partial<Product>):Promise<Product>;
    updatePrice(id:string,newPrice:number):Promise<Product>;
    updateStock(id:string,newStock:number):Promise<Product>;
    deleteProduct(id:string):Promise<void>;
    getProductById(id:string):Promise<Product|null>;
    getAllProducts(search?:string,isActive?:boolean,categoryId?:string):Promise<Product[]>;
    countProducts(search?:string,isActive?:boolean,categoryId?:string):Promise<number>;
}
export const IProductServiceKey = 'IProductService';