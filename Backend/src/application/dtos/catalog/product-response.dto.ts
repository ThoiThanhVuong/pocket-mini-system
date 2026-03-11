export class ProductResponseDto{
    id:string;
    name:string;
    sku:string;
    price:number;
    description:string;
    image:string;
    categoryId: string | null;
    unit:string;
    minStockLevel:number;
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
    stockQuantity:number;
}