import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IProductRepository } from "../../../core/interfaces/repositories/inventory/product.repository.interface";
import type { IStockRepository } from "../../../core/interfaces/repositories/inventory/stock.repository.interface";
import { IProductService } from "../../../core/interfaces/services/inventory/product.service.interface";
import { ICategoryServiceKey } from "../../../core/interfaces/services/inventory/category.service.interface";
import type { ICategoryService } from "../../../core/interfaces/services/inventory/category.service.interface";
import { Product } from "../../../core/domain/entities/warehouse/product.entity";
import { CreateProductDto } from "../../dtos/catalog/create-product.dto";
import { UpdateProductDto } from "../../dtos/catalog/update-product.dto";
import { ProductMapper } from "../../mappers/product.mapper";
import { IPaginationOptions, IPaginatedResult } from "../../../shared/types/pagination.type";
@Injectable()   
export class ProductService implements IProductService{
    constructor(
        @Inject('IProductRepository')
        private readonly productRepo: IProductRepository,
        @Inject('IStockRepository')
        private readonly stockRepo: IStockRepository,
        @Inject(ICategoryServiceKey)
        private readonly categoryService: ICategoryService,
    ){}
    async createProduct(name: string, sku: string, price: number, description: string, image: string, categoryId: string, unit: string, minStock: number): Promise<Product> {
        const existingProduct = await this.productRepo.findBySku(sku);
        if(existingProduct){
            throw new BadRequestException(`SKU "${sku}" đã tồn tại`);
        }
        const dto: CreateProductDto = {
            name,
            sku,
            price,
            description,
            image,
            categoryId,
            unit,
            minStockLevel:minStock
        };
        const newProduct = ProductMapper.toDomain(dto);
        return await this.productRepo.save(newProduct);
    }
    async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
        const existingProduct = await this.productRepo.findOneById(id);
        if(!existingProduct){
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        // #5: Kiểm tra SKU trùng khi đổi SKU
        if (data.sku !== undefined && data.sku !== existingProduct.sku) {
            const duplicate = await this.productRepo.findBySku(data.sku);
            if (duplicate) {
                throw new BadRequestException(`SKU "${data.sku}" đã được sử dụng bởi sản phẩm khác`);
            }
            existingProduct.sku = data.sku;
        }

        if (data.name !== undefined)        
            existingProduct.name = data.name;
        if (data.price !== undefined)       
            existingProduct.price = data.price;
        if (data.description !== undefined) 
            existingProduct.description = data.description;
        if (data.image !== undefined)       
            existingProduct.image = data.image;
        if (data.categoryId !== undefined)  
            existingProduct.categoryId = data.categoryId;
        if (data.unit !== undefined)        
            existingProduct.unit = data.unit;
        if (data.isActive !== undefined)    
            existingProduct.isActive = data.isActive;
        if (data.minStockLevel !== undefined) 
            existingProduct.minStockLevel = data.minStockLevel;
        return await this.productRepo.save(existingProduct);
    }

    async deleteProduct(id: string): Promise<void> {
        const product = await this.productRepo.findOneById(id);
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        // #1: Kiểm tra tồn kho trước khi xóa
        const totalStock = await this.stockRepo.getTotalStockByProduct(id);
        if (totalStock > 0) {
            throw new BadRequestException(
                `Không thể xóa sản phẩm "${product.name}" vì còn ${totalStock} đơn vị trong kho. Hãy xuất hết hàng trước.`
            );
        }

        product.isActive = false;
        await this.productRepo.save(product);
    }

    async getProductById(id: string): Promise<Product | null> {
        return await this.productRepo.findOneById(id);
    }

    async getAllProducts(search?: string, isActive?: boolean, categoryId?: string, options?: IPaginationOptions): Promise<IPaginatedResult<Product>> {
        let categoryIds: string[] | undefined = undefined;
        if (categoryId) {
            categoryIds = await this.categoryService.getDescendantIds(categoryId);
        }
        return await this.productRepo.findAllWithFilters(search, isActive, categoryIds || categoryId, options);
    }

    async countProducts(search?: string, isActive?: boolean, categoryId?: string): Promise<number> {
        let categoryIds: string[] | undefined = undefined;
        if (categoryId) {
            categoryIds = await this.categoryService.getDescendantIds(categoryId);
        }
        const products = await this.productRepo.findAllWithFilters(search, isActive, categoryIds || categoryId);
        return products.meta.totalItems;
    }

    async updatePrice(id: string, newPrice: number): Promise<Product> {
        const product = await this.productRepo.findOneById(id);
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        product.updatePrice(newPrice);  
        return await this.productRepo.save(product);
    }

    async updateStock(id: string, newStock: number): Promise<Product> {
        const product = await this.productRepo.findOneById(id);
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        product.minStockLevel = newStock;
        return await this.productRepo.save(product);
    }
    
}
    
