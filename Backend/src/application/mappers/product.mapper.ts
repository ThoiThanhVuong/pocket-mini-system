import { CreateProductDto } from "src/application/dtos/catalog/create-product.dto";
import { Product } from "../../core/domain/entities/warehouse/product.entity";
import { ProductResponseDto } from "../dtos/catalog/product-response.dto";
import { v4 as uuidv4 } from 'uuid';
export class ProductMapper{
    static toResponse(product:Product):ProductResponseDto{
        return {
            id:product.id,
            name:product.name,
            sku:product.sku,
            price:product.price,
            description:product.description,
            image:product.image,
            categoryId:product.categoryId,
            unit:product.unit,
            minStockLevel:product.minStockLevel,
            isActive:product.isActive,
            createdAt:product.createdAt,
            updatedAt:product.updatedAt,
            stockQuantity:product.stockQuantity
        }
    }
    static toDomain(dto:CreateProductDto):Product{
        return new Product(
            uuidv4(),
            dto.sku,
            dto.name,
            dto.description??'',
            dto.image??'',
            dto.categoryId,
            dto.unit,
            dto.price,
            true,
            new Date(),
            new Date(),
            dto.minStockLevel??0,
            0
        )
    }
}